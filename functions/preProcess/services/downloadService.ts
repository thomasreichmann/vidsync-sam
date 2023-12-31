import { createErrorType } from "../lib/baseError.js";
import { timed } from "../lib/decorators.js";
import S3Service from "./s3Service.js";

const BUCKET_NAME = "vidsync-compiler";

export default class DownloadService {
  s3Service: S3Service;

  constructor(s3Service: S3Service = new S3Service(BUCKET_NAME)) {
    this.s3Service = s3Service;
  }

  @timed
  async download(key: string, outputDir: string): Promise<string> {
    try {
      return await this.s3Service.download(key, outputDir);
    } catch (err) {
      throw new DownloadError(`Failed to download ${key} from s3`);
    }
  }

  @timed
  async upload(key: string, filePath: string): Promise<void> {
    try {
      await this.s3Service.upload(filePath, key);
    } catch (err) {
      throw new DownloadError(`Failed to upload ${key} to s3`);
    }
  }
}

export const DownloadError = createErrorType({ errorName: "download_error" });
