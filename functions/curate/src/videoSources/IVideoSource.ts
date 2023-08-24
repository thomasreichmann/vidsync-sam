export enum VideoSourceType {
  Twitch = "twitch",
}

interface BaseVideoSourceOptions {
  quantity: number;
  languages: string[];
}

export interface TwitchVideoSourceOptions extends BaseVideoSourceOptions {
  type: VideoSourceType.Twitch;
  gameIds: string[];
}

export type VideoSourceOptions = TwitchVideoSourceOptions; // Add more types here (e.g. | YouTubeVideoSourceOptions)

export default interface IVideoSource {
  getVideos(options: VideoSourceOptions): Promise<string[]>;
}
