import "dotenv/config";
import { CreateScheduleRequest, lambdaHandler } from "./src/app.js";

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

const payload = {
  quantity: 10,
  gameIds: ["21779", "516575", "29307"],
  bucket: "vidsync-compiler",
  auth: {
    userId: "644f06704ca5807da7af24fb",
    refreshToken: process.env.youtubeRefreshToken,
  },
  languages: ["en"],
  titleTemplate: "This is a custom title: {0}",
  preProcessSettings: {
    videoCodec: "libx264",
    videoBitrate: "6000",
    videoPreset: "ultrafast",
  },
  concatenateSettings: {
    videoCodec: "libx264",
    videoBitrate: "6000",
    videoPreset: "ultrafast",
  },
};

const request: CreateScheduleRequest = {
  name: "644f06704ca5807da7af24fb",
  time: { hours: "13", minutes: "46" },
  state: "ENABLED",
  payload,
};

const res = lambdaHandler(request, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
