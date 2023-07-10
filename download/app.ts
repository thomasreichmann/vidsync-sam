import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import Stream from "stream";
import DownloadService from "./services/downloadService.js";
import S3Service from "./services/s3Service.js";
import TwitchService from "./services/twitchService.js";

const BUCKET_NAME = "vidsync-compiler";
const BUCKET_FOLDER = "clips/";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const TEMP_DIR = path.join(ROOT_DIR, "temp");

const CLIP_QUANTITY = 10;
const GAME_ID = "21779";

const s3Service = new S3Service(BUCKET_NAME);
const twitchService = new TwitchService();
const downloadService = new DownloadService();

interface LambdaEvent {
  quantity: number;
  gameId: string;
}

export const lambdaHandler = async (request: LambdaEvent) => {
  let times: { [key: string]: number } = {};

  try {
    // Create temp and output directories
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    // Get clips for gameId
    const clips = await twitchService.getClips(GAME_ID, CLIP_QUANTITY);
    const downloadUrls = clips.map((clip) =>
      twitchService.generateDownloadUrl(clip)
    );

    // Download clips
    const clipStreams = await Promise.all(
      downloadUrls.map((url) => downloadService.get(url))
    );

    // Upload clips to S3
    const uploadPromises = clipStreams.map((stream, index) => {
      const clip = clips[index];
      const clipName = clip.id;
      const clipPath = path.join(BUCKET_FOLDER, clipName);

      return s3Service.upload(stream as Stream.Readable, clipPath);
    });

    let result = await Promise.all(uploadPromises);

    // Cleanup
    fs.promises.rm(TEMP_DIR, { recursive: true, force: true });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "hello world ts changed",
        times: times,
      }),
    };
  } catch (err) {
    // console.log("Error", err);

    throw err;
  }
};
