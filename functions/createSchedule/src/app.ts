import { Handler } from "aws-lambda";
import { createErrorType } from "./lib/baseError.js";
import ScheduleService, { CreateScheduleParams } from "./services/scheduleService.js";

export interface CreateScheduleResponse {
  statusCode: number;
  arn?: string;
}

const BadRequestError = createErrorType({ errorName: "bad-request" });

function validateRequest(request: CreateScheduleParams) {
  const hourRegex = /([0-1]?[0-9]|2[0-3])/;
  if (!request.time.hours.match(hourRegex)) {
    throw new BadRequestError("Invalid hours format");
  }

  const minuteRegex = /[0-5]?[0-9]/;
  if (!request.time.minutes.match(minuteRegex)) {
    throw new BadRequestError("Invalid minutes format");
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!`${request.time.hours}:${request.time.minutes}`.match(timeRegex)) {
    throw new BadRequestError("Invalid time format");
  }
}

export const lambdaHandler: Handler = async (request: CreateScheduleParams): Promise<any> => {
  validateRequest(request);

  const scheduleService = new ScheduleService();

  const schedule = await scheduleService.createSchedule(request);

  return {
    statusCode: schedule.$metadata.httpStatusCode ?? 500,
    arn: schedule.ScheduleArn,
  };
};
