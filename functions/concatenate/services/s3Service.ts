import { GetObjectCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";
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

  async download(key: string, outputDir: string): Promise<string> {
    try {
      // Create download command
      let download = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Download object from S3
      const objectData = await this.s3Client.send(download);
      const objectStream = this.fs.ReadStream.from(
        objectData.Body as stream.Readable
      );

      // Create a file path
      const filePath = `${outputDir}/${crypto.randomUUID()}.mp4`;

      // Return a promise that resolves or rejects based on the stream's finish or error events
      return new Promise((resolve, reject) => {
        const fileStream = this.fs
          .createWriteStream(filePath)
          .on("finish", () => resolve(filePath))
          .on("error", reject);

        objectStream.pipe(fileStream).on("error", reject);
      });
    } catch (err) {
      throw err;
    }
  }

  private async stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const _buf = Array<any>();

      stream.on("data", (chunk) => _buf.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(_buf)));
      stream.on("error", (err) => reject(`error converting stream - ${err}`));
    });
  }
}

export default S3Service;
