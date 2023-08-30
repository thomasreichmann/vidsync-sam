import { HelixClip } from "@twurple/api";
import { DAY_IN_MS, MAX_VIDEOS } from "../config.js";
import twurpleClient from "../lib/twurple.js";
import IVideoSource, { TwitchVideoSourceOptions } from "./IVideoSource.js";

export default class TwitchVideoSource implements IVideoSource {
  async getVideos(options: TwitchVideoSourceOptions): Promise<string[]> {
    const clipsPerGame = Math.floor(options.quantity / options.gameIds.length);
    const remainder = options.quantity % options.gameIds.length;

    const gameClipsPromises = options.gameIds.map((gameId, index) => {
      const extraClip = index < remainder ? 1 : 0;
      return this.getGameClips(gameId, clipsPerGame + extraClip, options.languages);
    });

    const gameClips = await Promise.all(gameClipsPromises);
    const clips = gameClips.flat();

    clips.sort((a, b) => b.views - a.views);
    return clips.map((clip) => this.generateDownloadUrl(clip));
  }

  private async getGameClips(gameId: string, quantity: number, languages: string[]): Promise<HelixClip[]> {
    let now = new Date();
    let yesterday = new Date(now.getTime() - DAY_IN_MS);

    let paginatedRequest = twurpleClient.clips.getClipsForGamePaginated(gameId, {
      startDate: yesterday.toISOString(),
      endDate: now.toISOString(),
    });

    const result: HelixClip[] = [];
    for await (const clip of paginatedRequest) {
      if (this.shouldSkipClip(clip, languages)) continue;

      result.push(clip);

      if (this.hasCollectedEnoughClips(result, quantity)) break;
    }

    return result;
  }

  private shouldSkipClip(clip: HelixClip, languages: string[]): boolean {
    return !languages.includes(clip.language);
  }

  private hasCollectedEnoughClips(clips: HelixClip[], desiredQuantity: number): boolean {
    return clips.length >= Math.min(desiredQuantity, MAX_VIDEOS);
  }

  private generateDownloadUrl(clip: HelixClip): string {
    return clip.thumbnailUrl.replace("-preview-480x272.jpg", ".mp4");
  }
}
