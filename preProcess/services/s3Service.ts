import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import stream from "stream";
import util from "util";
import s3Client from "../lib/s3";

const pipeline = util.promisify(stream.pipeline);

class S3Service {
  bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  list(prefix: string) {
    let command = new ListObjectsCommand({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    return s3Client.send(command);
  }

  upload(filePath: string) {
    console.time(`upload ${filePath}`);
    // Upload to /output in s3
    let uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: "output/" + path.basename(filePath),
      Body: fs.createReadStream(filePath),
      ContentType: "video/mp4",
    });

    return s3Client.send(uploadCommand);
  }

  download(key: string, outputDir: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Create download command
      let download = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Download object from s3 and convert to a readable stream
      let objectStream = fs.ReadStream.from(
        (await s3Client.send(download)).Body! as stream.Readable
      );

      // make sure that outputDir exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log(".");
      }

      // Create a write stream to save the S3 object to a file
      const fileStream = fs
        .createWriteStream(`${outputDir}/${crypto.randomUUID()}.mp4`)
        .on("close", resolve)
        .on("error", reject);

      // Use stream pipeline to handle backpressure and error handling
      try {
        await pipeline(objectStream, fileStream);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default S3Service;
