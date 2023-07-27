import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import DownloadService from "./services/downloadService.js";
import VideoService from "./services/videoService.js";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const OUTPUT_DIR = path.join(ROOT_DIR, "clips");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

const downloadService = new DownloadService();
const videoService = new VideoService();

interface ProcessRequest {
  bucket?: string;
  key?: string;
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const lambdaHandler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<LambdaResponse> => {
  const request: ProcessRequest = JSON.parse(event.body || "{}");

  if (!request.bucket) {
    console.log("Bad request: missing quantity");
    return {
      statusCode: 400,
      body: "Missing bucket name",
    };
  }

  if (!request.key) {
    console.log("Bad request: missing gameId");
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

  let inputPath = await downloadService.download(request.key, TEMP_DIR);
  let outputPath = path.join(OUTPUT_DIR, request.key);

  let outputFile = await videoService.normalize(inputPath, outputPath);

  // Extract directory and filename from the original key
  const dirName = path.dirname(request.key);
  const fileName = path.basename(request.key);

  // Create the new filename and key
  const newFileName = `normalized_${fileName}`;
  const newKey = path.join(dirName, newFileName);

  // Upload using the new key
  await downloadService.upload(newKey, outputFile);

  return {
    statusCode: 200,
    body: JSON.stringify({
      newKey,
    }),
  };
};
