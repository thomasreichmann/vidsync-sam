import { lambdaHandler } from "./app.js";

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

const res = lambdaHandler(
  [
    "https://clips-media-assets2.twitch.tv/2lz7rS3HAVqIWyI9Zle-JA/AT-cm%7C2lz7rS3HAVqIWyI9Zle-JA.mp4",
    "https://clips-media-assets2.twitch.tv/UJ7IqMyT0HU_Aj_dxIk-eA/41033140600-offset-55272.mp4",
    "https://clips-media-assets2.twitch.tv/T2UcBjg6NcRBjiGZoJ7dvA/AT-cm%7CT2UcBjg6NcRBjiGZoJ7dvA.mp4",
    "https://clips-media-assets2.twitch.tv/rT0kiZiFeshz8D09QGbnNg/AT-cm%7CrT0kiZiFeshz8D09QGbnNg.mp4",
    "https://clips-media-assets2.twitch.tv/oIrDPJaNpatvpqi-ui50EA/42668587083-offset-5940.mp4",
  ],
  context,
  () => {}
);

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
