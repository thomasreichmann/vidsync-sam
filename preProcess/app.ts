import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import S3Service from "./services/s3Service";
import VideoService from "./services/videoService";

const BUCKET_NAME = "vidsync-compiler";
const BUCKET_FOLDER = "clips/";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const OUTPUT_DIR = path.join(ROOT_DIR, "clips");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

const s3Service = new S3Service(BUCKET_NAME);
const videoService = new VideoService(OUTPUT_DIR, TEMP_DIR);

export const lambdaHandler = async (_: any) => {
  let times: { [key: string]: number } = {};

  // Create temp and output directories
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  let downloadPromises = ((await s3Service.list(BUCKET_FOLDER)).Contents ?? [])
    .filter((content) => content?.Key?.endsWith(".mp4"))
    .map((content) => s3Service.download(content.Key!, OUTPUT_DIR));

  let downloadStartTime = Date.now();
  await Promise.all(downloadPromises);
  times["download time"] = Date.now() - downloadStartTime;
  console.log(`Download time: ${times["download time"]}ms`);

  let files = (await fs.promises.readdir(OUTPUT_DIR)).map((file) =>
    path.join(OUTPUT_DIR, file)
  );

  let concatStartTime = Date.now();
  await videoService.concatenateVideos(files);
  times["concat time"] = Date.now() - concatStartTime;
  console.log(`Concat time: ${times["concat time"]}ms`);
  // ts

  // TODO: use path returned from concat function
  let uploadStartTime = Date.now();
  await s3Service.upload(path.join(OUTPUT_DIR, "output.mp4"));
  times["upload time"] = Date.now() - uploadStartTime;
  console.log(`Upload time: ${times["upload time"]}ms`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      times,
    }),
  };
};
