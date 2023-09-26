import { ScheduleState } from "@aws-sdk/client-scheduler";
import { Handler } from "aws-lambda";
import { createErrorType } from "./lib/baseError.js";
import ScheduleService, { CreateScheduleParams, ScheduleTime } from "./services/scheduleService.js";

export interface CreateScheduleResponse {
  statusCode: number;
  arn?: string;
}

export interface CreateScheduleRequest {
  name: string;
  time: ScheduleTime;
  state: ScheduleState;
  payload: any;
}

const BadRequestError = createErrorType({ errorName: "bad-request" });

function validateRequest(request: CreateScheduleRequest) {
  const hourRegex = /^([0-1]?[0-9]|2[0-3])$/;
  if (!request.time.hours.match(hourRegex)) {
    throw new BadRequestError("Invalid hours format");
  }

  const minuteRegex = /^[0-5]?[0-9]$/;
  if (!request.time.minutes.match(minuteRegex)) {
    throw new BadRequestError("Invalid minutes format");
  }
}

export const lambdaHandler: Handler = async (request: CreateScheduleRequest): Promise<any> => {
  validateRequest(request);

  const scheduleService = new ScheduleService();

  const input: CreateScheduleParams = {
    ...request,
    targetArn: process.env.TARGET_ARN!,
    roleArn: process.env.ROLE_ARN!,
    groupName: process.env.GROUP_NAME!,
  };
  const schedule = await scheduleService.createSchedule(input);

  return {
    statusCode: schedule.$metadata.httpStatusCode ?? 500,
    arn: schedule.ScheduleArn,
  };
};
