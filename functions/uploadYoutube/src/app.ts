import { Handler } from "aws-lambda";
import { createErrorType } from "./lib/baseError";

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

  console.log("Uploading file...");

  /** TODO:
   * - build the auth client
   * - import aws lib from other lambdas
   * - verify token age
   * - see what the difference is between the different tokens
   */

  return {};
};
