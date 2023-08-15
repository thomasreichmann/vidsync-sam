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

const event: { body: ProcessRequest } = {
  body: {
    bucket: "vidsync-compiler",
    keys: [
      "clips/normalized_CuriousScaryQueleaOneHand-_kDzkCXOh8naOA0m.mp4",
      "clips/EnergeticConcernedPistachioCclamChamp-UZu7-A7V0aygKVJ-.mp4",
    ],
  },
};

const res = lambdaHandler(event, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
