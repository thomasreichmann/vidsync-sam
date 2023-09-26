import fs from "fs";
import { Auth, google, youtube_v3 } from "googleapis";
import { VideoMetadata } from "../app.js";

export default class YoutubeService {
  youtube: youtube_v3.Youtube;
  auth: Auth.OAuth2Client;

  constructor(client: { clientId: string; clientSecret: string }, refreshToken: string) {
    const auth = new google.auth.OAuth2({ ...client });

    auth.setCredentials({
      refresh_token: refreshToken,
    });
    google.options({ auth });

    this.youtube = google.youtube("v3");
    this.auth = auth;
  }

  async uploadVideo(videoStream: fs.ReadStream, metadata: VideoMetadata) {
    const uploadParams = this.generateUploadParams(videoStream, metadata);

    const res = await this.youtube.videos.insert(uploadParams);

    console.log(`Upload result: ${res.status} ${res.statusText}`);
    console.log(`${JSON.stringify(res.data)}`);

    return res;
  }

  private generateUploadParams(body: any, metadata: VideoMetadata): youtube_v3.Params$Resource$Videos$Insert {
    return {
      part: ["snippet", "status", "id"],
      requestBody: {
        snippet: {
          ...metadata,
        },
        status: {
          privacyStatus: metadata.privacyStatus,
          madeForKids: false,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body,
      },
    };
  }
}
