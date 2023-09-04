import { MetadataResponse, VideoInfo } from "../app.js";

export default class MetadataService {
  generateMetadata(infos: VideoInfo[]): MetadataResponse {
    const title = this.generateTitle(infos);
    const description = this.generateDescription(infos);

    return { title, description };
  }

  private generateTitle(infos: VideoInfo[]): string {
    return infos.map((info) => info.title).join(", ");
  }

  private generateDescription(infos: VideoInfo[]): string {
    return infos.map((info) => info.creatorName).join(", ");
  }
}
