import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import S3Service from "./services/s3Service";

const BUCKET_NAME = "vidsync-compiler";
const BUCKET_FOLDER = "clips/";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const TEMP_DIR = path.join(ROOT_DIR, "temp");

const s3Service = new S3Service(BUCKET_NAME);

export const lambdaHandler = async (_: any) => {
  let times: { [key: string]: number } = {};

  try {
    // Create temp and output directories
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    // Cleanup
    fs.promises.rm(TEMP_DIR, { recursive: true, force: true });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "hello world ts changed",
        times: times,
      }),
    };
  } catch (err) {
    // console.log("Error", err);

    throw err;
  }
};
