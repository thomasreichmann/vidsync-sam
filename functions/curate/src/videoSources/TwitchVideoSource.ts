import { HelixClip } from "@twurple/api";
import { MAX_VIDEOS } from "../config.js";
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
    let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let request = twurpleClient.clips.getClipsForGamePaginated(gameId, {
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
    });

    let page: HelixClip[] = [];
    const result: HelixClip[] = [];

    while (this.shouldContinueFetching(MAX_VIDEOS, (page = await request.getNext()), result)) {
      result.push(...page);
    }

    result.splice(quantity);

    return result;
  }

  private generateDownloadUrl(clip: HelixClip): string {
    return clip.thumbnailUrl.replace("-preview-480x272.jpg", ".mp4");
  }

  private shouldContinueFetching(max: number, page: any[], result: any[]): boolean {
    return Boolean(result.length <= max && page.length);
  }
}
