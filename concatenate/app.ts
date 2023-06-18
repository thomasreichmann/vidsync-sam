import "dotenv/config";
import os from "os";
import path from "path";
import S3Service from "./services/s3Service";
import VideoService from "./services/videoService";

const BUCKET_NAME = "vidsync-compiler";
const BUCKET_FOLDER = "clips/";

const IS_LAMBDA_ENVIRONMENT = !!process.env.AWS_EXECUTION_ENV;
const ROOT_DIR = IS_LAMBDA_ENVIRONMENT ? os.tmpdir() : ".";

const OUTPUT_DIR = path.join(ROOT_DIR, "clips");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

const s3Service = new S3Service(BUCKET_NAME);
const videoService = new VideoService(OUTPUT_DIR, TEMP_DIR);

export const lambdaHandler = async (_: any) => {
  let times: { [key: string]: number } = {};
};
