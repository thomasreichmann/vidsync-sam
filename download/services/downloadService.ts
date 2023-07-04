import defaultFs from "fs";
import defaultFetch from "node-fetch";
import BaseError from "../lib/baseError.js";

export default class DownloadService {
  constructor(
    private fetch: { fetch: typeof defaultFetch } = { fetch: defaultFetch },
    private fs: typeof defaultFs = defaultFs
  ) {}

  async get(url: string): Promise<NodeJS.ReadableStream> {
    const response = await this.fetch.fetch(url);

    if (!response.ok)
      throw new DownloadError(`unexpected response ${response.statusText}`);

    if (!response.body) throw new DownloadError("no response body");

    return response.body;
  }

  async save(url: string, stream: NodeJS.ReadableStream): Promise<string> {
    let file = this.fs.createWriteStream(url);

    return new Promise((resolve, reject) => {
      stream
        .pipe(file)
        .on("error", (err: Error) => reject(new SaveError(err.message)))
        .on("finish", () => resolve(url));
    });
  }
}

export class SaveError extends BaseError {
  static error = "save_error";

  constructor(cause: string) {
    super(SaveError.error, cause, true);
  }
}

export class DownloadError extends BaseError {
  static error = "download_error";

  constructor(cause: string) {
    super(DownloadError.error, cause, true);
  }
}
