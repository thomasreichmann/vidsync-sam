import crypto from "crypto";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { AudioCodec, FFmpegVideoCodec, FFmpegVideoFormat, FFmpegVideoPreset } from "../lib/ffmpeg.js";

const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  videoCodec: "libx264",
  videoBitrate: "8000",
  videoPreset: "ultrafast",
  audioCodec: "libmp3lame",
  scale: "1920:1080",
  sar: "1:1",
  format: "mp4",
};

export interface VideoSettings {
  videoCodec?: FFmpegVideoCodec;
  videoBitrate?: string;
  videoPreset?: FFmpegVideoPreset;
  audioCodec?: AudioCodec;
  scale?: string;
  sar?: string;
  format?: FFmpegVideoFormat;
}

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

  async concatenateVideos(filePaths: string[], options: VideoSettings = {}): Promise<string> {
    // Merge default options with user options (if any)
    options = {
      ...DEFAULT_VIDEO_SETTINGS,
      ...options,
    };

    console.log("using options:", options);

    const outputFilePath = path.join(this.outputDir, `concatenated_${crypto.randomUUID()}.mp4`);

    const ffmpegCommand = Ffmpeg();
    filePaths.forEach((filePath) => ffmpegCommand.input(filePath));

    const filterSpecs = filePaths
      .map((_, index) => {
        return `[${index}:v]scale=${options.scale},setsar=${options.sar}[v${index}]`;
      })
      .join(";");

    // Prepare ffmpeg command for execution
    ffmpegCommand
      .videoCodec(options.videoCodec as string)
      .audioCodec(options.audioCodec as string)
      .videoBitrate(options.videoBitrate as string)
      .format(options.format as string)
      .outputOptions(`-preset ${options.videoPreset}`)
      .complexFilter(filterSpecs);

    // Get duration for progress log calculation
    const totalDuration = await this.getTotalDuration(filePaths);

    return this.executeFfmpegMerge(ffmpegCommand, outputFilePath, totalDuration);
  }

  private async executeFfmpegMerge(
    ffmpegCommand: Ffmpeg.FfmpegCommand,
    outputPath: string,
    totalDuration: number
  ): Promise<string> {
    // SetupFFmpeg logs
    ffmpegCommand
      .on("stderr", (stderrLine) => {
        console.log("FFmpeg output: " + stderrLine);
      })
      .on("progress", (progress) => {
        const currentSeconds = this.getSeconds(progress.timemark);
        const progressPercentage = this.getProgress(currentSeconds, totalDuration);
        console.log("Progress:", progressPercentage.toFixed(2), "%");
      });

    // Setup promise responses and run merge
    return new Promise((resolve, reject) => {
      ffmpegCommand
        .on("error", (err) => {
          console.error("Error concatenating videos:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("Videos concatenated successfully!");
          resolve(outputPath);
        })
        .mergeToFile(outputPath, this.tempDir);
    });
  }

  async getVideoFiles(): Promise<string[]> {
    return fs.promises.readdir(this.outputDir);
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
