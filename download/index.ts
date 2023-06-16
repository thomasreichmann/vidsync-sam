import "dotenv/config";
import path from "path";
import S3Service from "./services/s3Service";
import VideoService from "./services/videoService";

const BUCKET_NAME = "vidsync-compiler";
const BUCKET_FOLDER = "clips/";

const OUTPUT_DIR = path.resolve("./clips");

const s3Service = new S3Service(BUCKET_NAME);
const videoService = new VideoService(OUTPUT_DIR);

export const handler = async (_: any) => {
  try {
    // List all files in the bucket
    let response = await s3Service.list(BUCKET_FOLDER);

    let contents = response.Contents ?? [];

    // Remove any non mp4 files
    contents = contents.filter((content) => content?.Key?.endsWith(".mp4"));

    // Download each file with Promise.all
    let downloadPromises = contents.map((content) =>
      s3Service.download(content.Key!, OUTPUT_DIR)
    );

    console.time("download time");
    await Promise.all(downloadPromises);
    console.timeEnd("download time");

    const videoFiles = await videoService.getVideoFiles();

    let resizePromises = videoFiles.map((file) =>
      videoService.resizeVideo(path.join("./clips", file))
    );

    console.time("total resize");
    await Promise.all(resizePromises);
    console.timeEnd("total resize");

    // Upload each file with Promise.all to s3 /output
    let uploadPromises = videoFiles.map((file) =>
      s3Service.upload(path.join("./clips", file))
    );

    console.time("total upload");
    await Promise.all(uploadPromises);
    console.timeEnd("total upload");
  } catch (err) {
    console.log("Error", err);
  }
};
