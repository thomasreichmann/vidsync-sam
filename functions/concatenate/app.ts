import { Handler } from "aws-lambda";
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
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

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const lambdaHandler: Handler = async (event: {
  body: ProcessRequest;
}): Promise<LambdaResponse> => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const request = event.body as ProcessRequest;

  if (!request.bucket) {
    console.log("Bad request: missing bucket name");
    return {
      statusCode: 400,
      body: "Missing bucket name",
    };
  }

  if (!request.keys) {
    console.log("Bad request: missing key");
    return {
      statusCode: 400,
      body: "Missing key",
    };
  }

  // Create temp and output directories
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const s3Service = new S3Service(request.bucket);
  const videoService = new VideoService(OUTPUT_DIR, TEMP_DIR);

  const inputFilePaths = await Promise.all(
    request.keys.map((key) => s3Service.download(key, TEMP_DIR))
  );

  let outputFilePath = await videoService.concatenateVideos(inputFilePaths);

  // Extract directory and filename from the original key
  const dirName = path.dirname(request.keys[0]);
  const fileName = path.basename(outputFilePath);

  // Create the new filename and key
  const newKey = path.join(dirName, fileName);

  // Upload using the new key
  await s3Service.upload(outputFilePath, newKey);

  // Cleanup
  console.log("Cleaning up temp and clips directories...");
  await Promise.all([
    fs.promises.rm(TEMP_DIR, { recursive: true, force: true }),
    fs.promises.rm(OUTPUT_DIR, { recursive: true, force: true }),
  ]);
  console.log("Cleanup complete");

  return {
    statusCode: 200,
    body: JSON.stringify({
      newKey,
    }),
  };
};
