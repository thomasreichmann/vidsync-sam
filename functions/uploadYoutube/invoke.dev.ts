import "dotenv/config";
import { UploadRequest, lambdaHandler } from "./src/app.js";

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

const refreshToken: string = process.env.refreshToken || "";
const userId: string = process.env.userId || "";

const request: UploadRequest = {
  bucket: "vidsync-compiler",
  key: "output/output.mp4",
  auth: {
    userId,
    refreshToken,
  },
  metadata: {
    title: "test upload",
    description: "test upload",
    privacyStatus: "private",
  },
};

const res = lambdaHandler(request, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
