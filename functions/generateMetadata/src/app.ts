import { Handler } from "aws-lambda";
import { TITLE_TEMPLATE } from "./config.js";
import { createErrorType } from "./lib/baseError.js";
import MetadataService from "./services/metadataService.js";

export interface MetadataRequest {
  infos?: VideoInfo[];
  titleTemplate?: string;
}

export interface VideoInfo {
  title: string;
  creatorName: string;
  creatorUrl: string;
  downloadUrl: string;
  originalUrl: string;
  durationSeconds: number;
}

export interface MetadataResponse {
  title: string;
  description: string;
}

const BadRequestError = createErrorType({ errorName: "bad-request" });

function validateRequest(request: MetadataRequest): asserts request is Required<MetadataRequest> {
  if (!request) {
    throw new BadRequestError("Request object is missing.");
  }

  if (typeof request.infos !== "object" || request.infos.length === 0) {
    throw new BadRequestError("Invalid or missing infos.");
  }
}

export const lambdaHandler: Handler = async (request: MetadataRequest): Promise<MetadataResponse> => {
  validateRequest(request);

  const metadataService = new MetadataService();

  return metadataService.generateMetadata(request.infos, request.titleTemplate ?? TITLE_TEMPLATE);
};
