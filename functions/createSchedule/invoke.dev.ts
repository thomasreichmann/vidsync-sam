import "dotenv/config";
import { lambdaHandler } from "./src/app.js";
import { CreateScheduleParams } from "./src/services/scheduleService";

const context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "",
  functionVersion: "",
  invokedFunctionArn: "",
  memoryLimitInMB: "",
  awsRequestId: "",
  logGroupName: "",
  logStreamName: "",
  getRemainingTimeInMillis: function (): number {
    throw new Error("Function not implemented.");
  },
  done: function (error?: Error | undefined, result?: any): void {
    throw new Error("Function not implemented.");
  },
  fail: function (error: string | Error): void {
    throw new Error("Function not implemented.");
  },
  succeed: function (messageOrObject: any): void {
    throw new Error("Function not implemented.");
  },
};

const userId: string = process.env.TARGET_ARN!;

const request: CreateScheduleParams = {
  targetArn: "",
  name: "",
  groupName: "",
  time: { hours: "12", minutes: "0" },
  roleArn: "",
  state: "ENABLED",
};

const res = lambdaHandler(request, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
