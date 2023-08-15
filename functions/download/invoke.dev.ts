import { DownloadRequest, lambdaHandler } from "./app.js";

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

const event: DownloadRequest = {
  quantity: 2,
  gameId: "516575",
};

const res = lambdaHandler(event, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
