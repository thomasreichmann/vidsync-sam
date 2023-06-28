import { HelixClip } from "@twurple/api";
import twurpleClient from "../lib/twurple";

const MAX_VIDEOS = 5;

class TwitchService {
  async getClips(gameId: string, quantity: number): Promise<HelixClip[]> {
    let now = new Date();
    let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let request = twurpleClient.clips.getClipsForGamePaginated(gameId, {
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
    });

    let page: HelixClip[] = [];
    const result: HelixClip[] = [];

    while (
      this.shouldContinueFetching(
        MAX_VIDEOS,
        (page = await request.getNext()),
        result
      )
    ) {
      result.push(...page);
    }

    // Remove the last elements from the array so that length matches the quantity
    result.splice(quantity);

    return result;
  }

  private shouldContinueFetching(
    max: number,
    page: any[],
    result: any[]
  ): boolean {
    return Boolean(result.length <= max && page.length);
  }
}

export default TwitchService;
