import { Handler } from "aws-lambda";

export const lambdaHandler: Handler = async (request: any): Promise<string[]> => {
  console.log("Received request:", request);

  return ["hello", "world"];
};
