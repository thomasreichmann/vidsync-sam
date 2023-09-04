import { MetadataResponse, VideoInfo } from "../app.js";
import { MAX_YOUTUBE_DESCRIPTION_LENGTH, MAX_YOUTUBE_TITLE_LENGTH } from "../config.js";

interface Timestamp {
  name: string;
  seconds: number;
}

export default class MetadataService {
  generateMetadata(infos: VideoInfo[], titleTemplate: string): MetadataResponse {
    const title = this.generateTitle(infos, titleTemplate);
    const description = this.generateDescription(infos);

    return {
      title: this.truncate(title, MAX_YOUTUBE_TITLE_LENGTH),
      description: this.truncate(description, MAX_YOUTUBE_DESCRIPTION_LENGTH),
    };
  }

  private generateTitle(infos: VideoInfo[], template: string): string {
    const creators = infos.map((info) => info.creatorName).join(", ");

    return template.replace("{0}", creators);
  }

  private generateDescription(infos: VideoInfo[]): string {
    const timedChapters = this.generateTimedChapters(infos);
    const creatorLinks = this.generateCreatorLinks(infos);

    return `${creatorLinks}\n${timedChapters}`;
  }

  private generateCreatorLinks(infos: VideoInfo[]): string {
    let links = "";
    for (const info of infos) {
      links += `${info.creatorName}: ${info.creatorUrl}\n`;
    }

    return links;
  }

  private generateTimedChapters(infos: VideoInfo[]): string {
    let currentSeconds = 0;
    const timestamps: Timestamp[] = infos.map((info) => {
      let seconds = currentSeconds;
      currentSeconds += info.durationSeconds;

      return {
        name: info.creatorName,
        seconds,
      };
    });

    let timedChapters = "";
    for (const timestamp of timestamps) {
      const minutes = Math.floor(timestamp.seconds / 60);
      const seconds = Math.floor(timestamp.seconds % 60);

      timedChapters += `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${
        timestamp.name
      }\n`;
    }

    return timedChapters;
  }

  private truncate(originalString: string, maxCharacters: number) {
    return originalString.length > maxCharacters ? originalString.slice(0, maxCharacters - 1) : originalString;
  }
}
