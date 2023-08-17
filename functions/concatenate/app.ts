import { Handler } from "aws-lambda";
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import { createErrorType } from "./lib/baseError.js";
import S3Service from "./services/s3Service.js";
import VideoService from "./services/videoService.js";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const OUTPUT_DIR = path.join(ROOT_DIR, "clips");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

export interface ProcessRequest {
  bucket?: string;
  keys?: string[];
}

const BadRequestError = createErrorType({ errorName: "bad-request" });

export const lambdaHandler: Handler = async (
  request: ProcessRequest
): Promise<string> => {
  console.log("Received event:", request);

  if (!request.bucket) throw new BadRequestError("Missing bucket");
  if (!request.keys) throw new BadRequestError("Missing keys");

  // Create temp and output directories
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const s3Service = new S3Service(request.bucket);
  const videoService = new VideoService(OUTPUT_DIR, TEMP_DIR);

  console.log("Downloading clips...");
  const inputFilePaths = await Promise.all(
    request.keys.map((key) => s3Service.download(key, TEMP_DIR))
  );

  console.log("Concatenating clips...");
  console.time("concatenateVideos");
  let outputFilePath = await videoService.concatenateVideos(inputFilePaths);
  console.timeEnd("concatenateVideos");

  // Extract directory and filename from the original key
  const dirName = path.dirname(request.keys[0]);
  const fileName = path.basename(outputFilePath);

  // Create the new filename and key
  const newKey = path.join(dirName, fileName);

  // Upload using the new key
  console.log("Uploading concatenated video...");
  await s3Service.upload(outputFilePath, newKey);

  // Calculate the ratio of the concatenated video to the original videos combined size
  const outputFileSize = fs.statSync(outputFilePath).size / 1000000;
  let inputsFileSize = inputFilePaths.reduce(
    (acc, curr) => acc + fs.statSync(curr).size / 1000000,
    0
  );
  const ratio = ((outputFileSize / inputsFileSize) * 100).toFixed(2);
  console.log(
    `inputFileSize: ${inputsFileSize}, outputFileSize: ${outputFileSize}, ratio: ${ratio}`
  );
  console.log(
    `Concatenated video is ${ratio}% the size of the original videos combined`
  );

  // Cleanup
  console.log("Cleaning up temp and clips directories...");
  await Promise.all([
    fs.promises.rm(TEMP_DIR, { recursive: true, force: true }),
    fs.promises.rm(OUTPUT_DIR, { recursive: true, force: true }),
  ]);
  console.log("Cleanup complete");

  return newKey;
};
