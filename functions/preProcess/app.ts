import { Handler } from "aws-lambda";
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import { createErrorType } from "./lib/baseError.js";
import DownloadService from "./services/downloadService.js";
import VideoService from "./services/videoService.js";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const OUTPUT_DIR = path.join(ROOT_DIR, "clips");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

const downloadService = new DownloadService();
const videoService = new VideoService();

export interface ProcessRequest {
  bucket?: string;
  key?: string;
}

const BadRequestError = createErrorType({ errorName: "bad-request" });

export const lambdaHandler: Handler = async (
  request: ProcessRequest
): Promise<string> => {
  console.log("Received event:", request);

  if (!request.bucket) throw new BadRequestError("Missing bucket name");
  if (!request.key) throw new BadRequestError("Missing key");

  // Create temp and output directories
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  // Download the file to the temp directory
  console.log("Downloading file...");
  let inputPath = await downloadService.download(request.key, TEMP_DIR);

  // Normalize the video and save it to the output directory
  console.log("Normalizing video...");
  let outputFile = await videoService.normalize(inputPath, OUTPUT_DIR);

  // Extract directory and filename from the original key
  const dirName = path.dirname(request.key);
  const fileName = path.basename(request.key);

  // Create the new filename and key
  const newFileName = `normalized_${fileName}`;
  const newKey = path.join(dirName, newFileName);

  // Upload using the new key
  console.log("Uploading file...");
  await downloadService.upload(newKey, outputFile);

  // Cleanup
  console.log("Cleaning up temp and clips directories...");
  await Promise.all([
    fs.promises.rm(TEMP_DIR, { recursive: true, force: true }),
    fs.promises.rm(OUTPUT_DIR, { recursive: true, force: true }),
  ]);
  console.log("Cleanup complete");

  return newKey;
};
