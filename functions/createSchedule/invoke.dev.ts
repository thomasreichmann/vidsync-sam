import "dotenv/config";
import { lambdaHandler } from "./src/app.js";
import { CreateScheduleParams } from "./src/services/scheduleService.js";

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

const request: CreateScheduleParams = {
  targetArn: process.env.TARGET_ARN!,
  name: "64604d383306f6c0a3561d19",
  groupName: process.env.GROUP_NAME!,
  time: { hours: "12", minutes: "0" },
  roleArn: process.env.ROLE_ARN!,
  state: "ENABLED",
};

console.log(request);

const res = lambdaHandler(request, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
