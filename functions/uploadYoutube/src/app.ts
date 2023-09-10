import { Handler } from "aws-lambda";
import os from "os";
import path from "path";
import { createErrorType } from "./lib/baseError.js";
import S3Service from "./services/s3Service.js";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";
const TEMP_DIR = path.join(ROOT_DIR, "temp");

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

  const filePath = await s3Service.download(request.key, TEMP_DIR);

  /** TODO:
   * - build the auth client
   * - verify token age
   * - see what the difference is between the different tokens
   */

  return {};
};
