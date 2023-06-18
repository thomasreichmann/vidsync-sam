import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

const ACCEPTED_FILE_EXTENSIONS = [".mp4", ".mov", ".avi"];

class VideoService {
  outputDir: string;
  tempDir: string;

  constructor(outputDir: string, tempDir: string) {
    this.outputDir = outputDir;
    this.tempDir = tempDir;

    // make sure that outputDir exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  }

  async getVideoFiles(): Promise<string[]> {
    let files = await fs.promises.readdir(this.outputDir);

    const videoFiles = files.filter((file) => {
      const extension = path.extname(file).toLowerCase();
      return ACCEPTED_FILE_EXTENSIONS.includes(extension);
    });

    return videoFiles;
  }

  async resizeVideo(filePath: string): Promise<void> {
    // Check if the video resolution is different from 1920x1080
    const tempFilePath = path.join(this.tempDir, path.basename(filePath));

    let fps = await this.getFPS(filePath);

    const outputOptions =
      fps < 60 ? "-vf scale=1920:1080,fps=fps=60" : "-vf scale=1920:1080";

    // Resize video and set fps to 60
    await this.resizeFfmpegVideo(filePath, tempFilePath, outputOptions);

    // Delete old video
    await fs.promises.unlink(filePath);

    // Move new video to the old location
    await fs.promises.rename(tempFilePath, filePath);
  }

  private async resizeFfmpegVideo(
    inputPath: string,
    outputPath: string,
    outputOptions: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Ffmpeg(inputPath)
        .outputOptions(outputOptions)
        .videoCodec("libx264")
        .outputOptions("-preset ultrafast") // This option should make resizing faster
        .on("error", reject)
        .on("end", resolve)
        .save(outputPath);
    });
  }

  private async getFPS(filePath: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      Ffmpeg.ffprobe(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = data.streams.find(
          (stream) => stream.codec_type === "video"
        );

        if (videoStream) {
          const fps = eval(videoStream.avg_frame_rate ?? "");
          resolve(fps);
        } else {
          reject(new Error("No video stream found."));
        }
      });
    });
  }
}

export default VideoService;
