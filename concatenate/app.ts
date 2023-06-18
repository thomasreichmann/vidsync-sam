import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import VideoService from "../shared/services/videoService";
import S3Service from "./services/s3Service";

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

  try {
    // Create temp and output directories
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }

    // List all files in the bucket
    let response = await s3Service.list(BUCKET_FOLDER);

    let contents = response.Contents ?? [];

    // Remove any non mp4 files
    contents = contents.filter((content) => content?.Key?.endsWith(".mp4"));

    // Download each file with Promise.all
    let downloadPromises = contents.map((content) =>
      s3Service.download(content.Key!, OUTPUT_DIR)
    );

    let downloadStartTime = Date.now();
    await Promise.all(downloadPromises);
    times["download time"] = Date.now() - downloadStartTime;
    console.log(`Download time: ${times["download time"]}ms`);

    const videoFiles = await videoService.getVideoFiles();

    let resizePromises = videoFiles.map((file) =>
      videoService.resizeVideo(path.join(OUTPUT_DIR, file))
    );

    let resizeStartTime = Date.now();
    await Promise.all(resizePromises);
    times["total resize"] = Date.now() - resizeStartTime;
    console.log(`Resize time: ${times["total resize"]}ms`);

    // Upload each file with Promise.all to s3 /output
    let uploadPromises = videoFiles.map((file) =>
      s3Service.upload(path.join(OUTPUT_DIR, file))
    );

    let uploadStartTime = Date.now();
    await Promise.all(uploadPromises);
    times["total upload"] = Date.now() - uploadStartTime;
    console.log(`Upload time: ${times["total upload"]}ms`);

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
