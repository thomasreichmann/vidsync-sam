import crypto from "crypto";
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

  async concatenateVideos(filePaths: string[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const outputFilePath = path.join(
        this.outputDir,
        `concatenated_${crypto.randomUUID()}.mp4`
      );

      const ffmpegCommand = Ffmpeg();
      filePaths.forEach((filePath) => {
        ffmpegCommand.input(filePath);
      });

      const totalDuration = await this.getTotalDuration(filePaths);

      ffmpegCommand
        .on("error", (err) => {
          console.error("Error concatenating videos:", err);
          reject(err); // Reject the promise if an error occurs
        })
        .on("end", () => {
          console.log("Videos concatenated successfully!");
          console.timeEnd("Execution time");
          resolve(outputFilePath); // Resolve the promise when the operation is completed
        })
        .on("progress", (progress) => {
          const currentSeconds = this.getSeconds(progress.timemark);
          const progressPercentage = this.getProgress(
            currentSeconds,
            totalDuration
          );
          console.log("Progress:", progressPercentage.toFixed(2), "%");
        })
        .videoCodec("libx264")
        .audioCodec("libmp3lame")
        .format("mp4")
        .outputOptions("-preset ultrafast") // Faster encoding
        .mergeToFile(outputFilePath, this.tempDir);
    });
  }

  async getVideoFiles(): Promise<string[]> {
    let files = await fs.promises.readdir(this.outputDir);

    // TODO: REMOVE THIS
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

  async getTotalDuration(filePaths: string[]): Promise<number> {
    const durationPromises = filePaths.map((filePath) => {
      return this.getDuration(filePath);
    });

    return Promise.all(durationPromises).then((durations) => {
      return durations.reduce((acc, curr) => acc + curr, 0);
    });
  }

  async getDuration(filePath: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      Ffmpeg.ffprobe(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.format.duration ?? 0);
      });
    });
  }

  getProgress(currentSeconds: number, totalSeconds: number): number {
    return (currentSeconds / totalSeconds) * 100;
  }

  getSeconds(time: string): number {
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);

    return hours * 3600 + minutes * 60 + seconds;
  }
}

export default VideoService;
