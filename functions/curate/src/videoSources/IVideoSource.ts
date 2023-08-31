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

export type VideoSourceOptions = TwitchVideoSourceOptions; // we will later add more types here (e.g. | YouTubeVideoSourceOptions)

export interface VideoResponse {
  title: string;
  creatorName: string;

  originalUrl: string;
  creatorUrl: string;
  downloadUrl: string;

  durationSeconds: number;
}

export default interface IVideoSource {
  getVideos(options: VideoSourceOptions): Promise<VideoResponse[]>;
}
