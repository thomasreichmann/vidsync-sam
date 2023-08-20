import crypto from "crypto";
import Ffmpeg, { FfmpegCommand, FfprobeData } from "fluent-ffmpeg";
import { promisify } from "util";

type FFmpegVideoCodec =
  | "libx264"
  | "libx265"
  | "libvpx"
  | "libvpx-vp9"
  | "libaom-av1"
  | "mpeg4"
  | "libxvid"
  | "vp8"
  | "vp9"
  | "av1"
  | "flv";

type FFmpegVideoPreset =
  | "ultrafast"
  | "superfast"
  | "veryfast"
  | "faster"
  | "fast"
  | "medium"
  | "slow"
  | "slower"
  | "veryslow"
  | "placebo";

export interface VideoSettings {
  videoCodec?: FFmpegVideoCodec;
  videoBitrate?: string;
  videoPreset?: FFmpegVideoPreset;
  scale?: string;
  sar?: string;
  fps?: number;
}

const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  videoCodec: "libx264",
  videoBitrate: "8000",
  videoPreset: "ultrafast",
  scale: "1920:1080",
  sar: "1:1",
  fps: 60,
};

export default class VideoService {
  ffmpeg: typeof Ffmpeg;
  ffprobe: (filePath: string) => Promise<FfprobeData>;

  constructor(ffmpeg: typeof Ffmpeg = Ffmpeg) {
    this.ffmpeg = ffmpeg;
    this.ffprobe = promisify(ffmpeg.ffprobe);
  }

  async normalize(inputPath: string, outputDir: string, options: VideoSettings = {}): Promise<string> {
    const outputPath = `${outputDir}/${crypto.randomUUID()}.mp4`;

    // Merge default values with passed options
    options = {
      ...DEFAULT_VIDEO_SETTINGS,
      ...options,
    };

    console.log("using options:", options);

    const idealVideoBitrate = await this.getIdealBitrate(inputPath, eval(options.videoBitrate as string));

    const outputOptions = `scale=${options.scale},fps=fps=${options.fps},setsar=${options.sar}`;

    const command = Ffmpeg(inputPath)
      .videoCodec(options.videoCodec as string)
      .videoBitrate(idealVideoBitrate)
      .outputOptions(`-preset ${options.videoPreset}`)
      .outputOptions("-vf", outputOptions)
      .addOutput(outputPath);

    await this.executeCommand(command);

    return outputPath;
  }

  async executeCommand(command: FfmpegCommand): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      command
        .on("error", reject)
        .on("end", resolve)
        .on("stderr", (stderrLine) => {
          console.log("FFmpeg output: " + stderrLine);
        })
        .run();
    });
  }

  private async getIdealBitrate(filePath: string, targetBitrate: number): Promise<number> {
    const data = await this.ffprobe(filePath);

    const videoStream = data.streams.find((stream) => stream.codec_type === "video");

    if (!videoStream) throw new Error("No video stream found");

    const videoBitrate = eval(videoStream.bit_rate ?? "");

    return Math.min(videoBitrate, targetBitrate);
  }

  async getFPS(filePath: string): Promise<number> {
    const data = await this.ffprobe(filePath);

    const videoStream = data.streams.find((stream) => stream.codec_type === "video");

    if (!videoStream) throw new Error("No video stream found");

    return eval(videoStream.avg_frame_rate ?? "");
  }
}
