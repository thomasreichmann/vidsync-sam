import { HelixClip } from "@twurple/api";
import { DAY_IN_MS, MAX_VIDEOS } from "../config.js";
import twurpleClient from "../lib/twurple.js";
import IVideoSource, { TwitchVideoSourceOptions } from "./IVideoSource.js";

export default class TwitchVideoSource implements IVideoSource {
  async getVideos(options: TwitchVideoSourceOptions): Promise<string[]> {
    const gameClips = await Promise.all(
      options.gameIds.map((gameId) => this.getGameClips(gameId, options.quantity, options.languages))
    );

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
