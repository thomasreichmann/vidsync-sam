import { lambdaHandler, ProcessRequest } from "./app.js";

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

const KEYS = [
  "clips/LuckyTentativeMouseSoBayed-ancAAaStdvlGmwRY",
  "clips/BashfulStormySangYouDontSay-8AqKsS3HgbU6wsKd",
  "clips/AgreeableInnocentShingleNerfBlueBlaster-OuKJyOOe-HKwc5IE",
  "clips/SaltyPlainLarkCharlietheUnicorn-XbEnVyts4W_4T5xX",
  "clips/DignifiedGloriousDumplingsDxAbomb-0PtY8gscPTsKCcPw",
];

const NORMALIZED_KEYS = [
  "clips/normalized_LuckyTentativeMouseSoBayed-ancAAaStdvlGmwRY",
  "clips/normalized_BashfulStormySangYouDontSay-8AqKsS3HgbU6wsKd",
  "clips/normalized_AgreeableInnocentShingleNerfBlueBlaster-OuKJyOOe-HKwc5IE",
  "clips/normalized_SaltyPlainLarkCharlietheUnicorn-XbEnVyts4W_4T5xX",
  "clips/normalized_DignifiedGloriousDumplingsDxAbomb-0PtY8gscPTsKCcPw",
];

const event: { body: ProcessRequest } = {
  body: {
    bucket: "vidsync-compiler",
    keys: KEYS,
  },
};

const res = lambdaHandler(event, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
