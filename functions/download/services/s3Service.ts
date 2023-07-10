import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import defaultFs from "fs";
import { default as Stream, default as stream } from "stream";
import defaultS3Client from "../lib/s3.js";

export interface UploadResult {
  bucket: string;
  key: string;
  statusCode: number;
}

class S3Service {
  bucketName: string;
  s3Client: S3;

  constructor(
    bucketName: string,
    s3Client: S3 = defaultS3Client,
    private fs: typeof defaultFs = defaultFs
  ) {
    this.bucketName = bucketName;
    this.s3Client = s3Client;
  }

  list(prefix: string) {
    let command = new ListObjectsCommand({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    return this.s3Client.send(command);
  }

  async upload(
    data: string | Stream.Readable,
    outputPath: string
  ): Promise<UploadResult> {
    const isStream = data instanceof Stream.Readable;
    const body = isStream
      ? await this.stream2buffer(data as Stream.Readable)
      : this.fs.createReadStream(data);

    // Upload to /output in s3
    let uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: outputPath,
      Body: body,
      ContentType: "video/mp4",
    });

    let result = await this.s3Client.send(uploadCommand);

    return {
      bucket: this.bucketName,
      key: outputPath,
      statusCode: result.$metadata.httpStatusCode!,
    };
  }

  /* c8 ignore start */
  download(key: string, outputDir: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Create download command
      let download = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Download object from s3 and convert to a readable stream
      let objectStream = this.fs.ReadStream.from(
        (await this.s3Client.send(download)).Body! as stream.Readable
      );

      // make sure that outputDir exists
      if (!this.fs.existsSync(outputDir)) {
        this.fs.mkdirSync(outputDir);
        console.log(".");
      }

      // Create a write stream to save the S3 object to a file
      const fileStream = this.fs
        .createWriteStream(`${outputDir}/${crypto.randomUUID()}.mp4`)
        .on("close", resolve)
        .on("error", reject);

      // Use stream pipeline to handle backpressure and error handling
      try {
        // await pipeline(objectStream, fileStream);
        objectStream.pipe(fileStream).on("error", reject).on("close", resolve);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const _buf = Array<any>();

      stream.on("data", (chunk) => _buf.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(_buf)));
      stream.on("error", (err) => reject(`error converting stream - ${err}`));
    });
  }
  /* c8 ignore stop */
}

export default S3Service;
