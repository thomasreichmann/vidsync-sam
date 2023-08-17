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

      const filterSpecs = filePaths
        .map((filePath, index) => {
          return `[${index}:v]scale=1920:1080,setsar=1:1[v${index}]`;
        })
        .join(";");

      ffmpegCommand
        .on("error", (err) => {
          console.error("Error concatenating videos:", err);
          reject(err); // Reject the promise if an error occurs
        })
        .on("stderr", (stderrLine) => {
          console.log("FFmpeg output: " + stderrLine);
        })
        .on("end", () => {
          console.log("Videos concatenated successfully!");
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
        .videoCodec("mpeg4")
        .audioCodec("libmp3lame")
        .videoBitrate("8000k")
        .format("mp4")
        .outputOptions("-preset ultrafast") // Faster encoding
        .complexFilter(filterSpecs)
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
