import defaultFs from "fs";
import defaultFetch from "node-fetch";
import BaseError from "../lib/baseError";

export default class DownloadService {
  constructor(
    private fetch: typeof defaultFetch = defaultFetch,
    private fs: typeof defaultFs = defaultFs
  ) {}

  async get(url: string): Promise<NodeJS.ReadableStream> {
    const response = await this.fetch(url);

    if (!response.ok)
      throw new DownloadError(`unexpected response ${response.statusText}`);

    if (!response.body) throw new DownloadError("no response body");

    return response.body;
  }

  async save(url: string, stream: NodeJS.ReadableStream): Promise<string> {
    let file = this.fs.createWriteStream(url);

    stream.pipe(file);

    return new Promise((resolve, reject) => {
      file.on("finish", () => resolve(url));
      file.on("error", (err: Error) => reject(new SaveError(err.message)));
    });
  }
}

export class SaveError extends BaseError {
  constructor(cause: string) {
    super("save_error", cause, true);
  }
}

export class DownloadError extends BaseError {
  constructor(cause: string) {
    super("download_error", cause, true);
  }
}
