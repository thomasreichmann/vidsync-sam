import { Handler } from "aws-lambda";
import fs from "fs";
import os from "os";
import path from "path";
import { createErrorType } from "./lib/baseError.js";
import S3Service from "./services/s3Service.js";
import YoutubeService from "./services/youtubeService.js";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";
const TEMP_DIR = path.join(ROOT_DIR, "temp");

export interface VideoMetadata {
  title: string;
  description: string;
}

export interface UploadRequest {
  bucket: string;
  key: string;
  auth: {
    userId: string;
    idToken: string;
    access_token: string;
    refreshToken: string;
    expiresAt: number;
  };
  metadata: VideoMetadata;
}

export interface UploadResponse {}

const BadRequestError = createErrorType({ errorName: "bad-request" });

function validateRequest(request: UploadRequest): asserts request is Required<UploadRequest> {
  if (!request) {
    throw new BadRequestError("Request object is missing.");
  }
}

export const lambdaHandler: Handler = async (request: UploadRequest): Promise<UploadResponse> => {
  validateRequest(request);

  const s3Service = new S3Service(request.bucket);

  const client = {
    clientId: process.env.clientId ?? "",
    clientSecret: process.env.clientSecret ?? "",
  };
  const youtubeService = new YoutubeService(client, request.auth);

  const filePath = await s3Service.download(request.key, TEMP_DIR);
  const videoStream = fs.createReadStream(filePath);

  const videoResponse = await youtubeService.uploadVideo(videoStream, request.metadata);

  console.log("Cleaning up temp directory...");
  fs.promises.rm(TEMP_DIR, { recursive: true, force: true });
  console.log("Cleanup complete");

  return videoResponse.data;
};
