import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import fs from "fs";
import { default as Stream, default as stream } from "stream";
import s3Client from "../lib/s3.js";

export interface UploadResult {
  bucket: string;
  key: string;
  statusCode: number;
}

class S3Service {
  bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async upload(data: string | Stream.Readable, outputPath: string): Promise<UploadResult> {
    const isStream = data instanceof Stream.Readable;
    const body = isStream ? await this.stream2buffer(data as Stream.Readable) : fs.createReadStream(data);

    // Upload to /output in s3
    let uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: outputPath,
      Body: body,
      ContentType: "video/mp4",
    });

    let result = await s3Client.send(uploadCommand);

    return {
      bucket: this.bucketName,
      key: outputPath,
      statusCode: result.$metadata.httpStatusCode!,
    };
  }

  async download(key: string, outputDir: string): Promise<string> {
    let download = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const objectData = await s3Client.send(download);
    const objectStream = fs.ReadStream.from(objectData.Body as stream.Readable);

    // Ensure outputDir exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log(".");
    }

    const filePath = `${outputDir}/${crypto.randomUUID()}.mp4`;

    return new Promise((resolve, reject) => {
      const fileStream = fs
        .createWriteStream(filePath)
        .on("finish", () => resolve(filePath))
        .on("error", reject);

      objectStream.pipe(fileStream).on("error", reject);
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
}

export default S3Service;
