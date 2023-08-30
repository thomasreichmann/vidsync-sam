import { Handler } from "aws-lambda";
import crypto from "crypto";
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import Stream from "stream";
import { createErrorType } from "./lib/baseError.js";
import DownloadService from "./services/downloadService.js";
import S3Service from "./services/s3Service.js";

const BUCKET_NAME = "vidsync-compiler";
const BUCKET_FOLDER = "clips/";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const TEMP_DIR = path.join(ROOT_DIR, "temp");

const s3Service = new S3Service(BUCKET_NAME);
const downloadService = new DownloadService();

const BadRequestError = createErrorType({ errorName: "bad-request" });

export const lambdaHandler: Handler = async (downloadUrls?: string[]): Promise<string[]> => {
  console.log("Received request:", downloadUrls);

  if (!downloadUrls) throw new BadRequestError("Missing urls");

  // Create temp and output directories
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
    console.log("Temp directory created:", TEMP_DIR);
  }

  // Download clips
  console.log("Downloading clips...");
  const clipStreams = await Promise.all(downloadUrls.map((url) => downloadService.get(url)));
  console.log("Clips downloaded");

  // Upload clips to S3
  console.log("Uploading clips to S3...");
  const uniqueKey = crypto.randomInt(10000);
  const uploadPromises = clipStreams.map((stream, index) => {
    const clipPath = path.join(BUCKET_FOLDER, `${uniqueKey}_${index}_${crypto.randomUUID()}.mp4`);

    return s3Service.upload(stream as Stream.Readable, clipPath);
  });

  let result = await Promise.all(uploadPromises);
  console.log("Upload completed:", result);

  // Cleanup
  console.log("Cleaning up temp directory...");
  fs.promises.rm(TEMP_DIR, { recursive: true, force: true });
  console.log("Cleanup complete");

  return result.map((uploadResult) => uploadResult.key);
};
