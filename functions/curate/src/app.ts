import { Handler } from "aws-lambda";
import { createErrorType } from "./lib/baseError.js";
import { VideoResponse, VideoSourceType } from "./videoSources/IVideoSource.js";
import TwitchVideoSource from "./videoSources/TwitchVideoSource.js";

export interface CurateRequest {
  quantity?: number;
  languages?: string[];
  gameIds?: string[];
}

const BadRequestError = createErrorType({ errorName: "bad-request" });

function validateRequest(request: CurateRequest): asserts request is Required<CurateRequest> {
  if (!request) {
    throw new BadRequestError("Request object is missing.");
  }

  if (typeof request.quantity !== "number" || request.quantity <= 0) {
    throw new BadRequestError("Invalid or missing quantity.");
  }

  if (
    !request.languages ||
    !Array.isArray(request.languages) ||
    request.languages.some((lang) => typeof lang !== "string")
  ) {
    throw new BadRequestError("Invalid or missing languages.");
  }

  if (!request.gameIds || !Array.isArray(request.gameIds) || request.gameIds.some((id) => typeof id !== "string")) {
    throw new BadRequestError("Invalid or missing gameIds.");
  }
}

export const lambdaHandler: Handler = async (request: CurateRequest): Promise<VideoResponse[]> => {
  validateRequest(request);

  const videoSource = new TwitchVideoSource();
  const videoLinks = await videoSource.getVideos({ ...request, type: VideoSourceType.Twitch });

  return videoLinks;
};
