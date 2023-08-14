import crypto from "crypto";
import Ffmpeg, { FfmpegCommand, FfprobeData } from "fluent-ffmpeg";
import { promisify } from "util";

export default class VideoService {
  ffmpeg: typeof Ffmpeg;
  ffprobe: (filePath: string) => Promise<FfprobeData>;

  constructor(ffmpeg: typeof Ffmpeg = Ffmpeg) {
    this.ffmpeg = ffmpeg;
    this.ffprobe = promisify(ffmpeg.ffprobe);
  }

  async normalize(inputPath: string, outputDir: string): Promise<string> {
    let fps = await this.getFPS(inputPath);
    const outputPath = `${outputDir}/${crypto.randomUUID()}.mp4`;

    const outputOptions =
      fps < 60 ? "-vf scale=1920:1080,fps=fps=60" : "-vf scale=1920:1080";

    const command = Ffmpeg(inputPath)
      .outputOptions(outputOptions)
      .videoCodec("libx264")
      .outputOptions("-preset ultrafast")
      .addOutput(outputPath);

    await this.executeCommand(command);

    return outputPath;
  }

  async executeCommand(command: FfmpegCommand): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      command.on("error", reject).on("end", resolve).run();
    });
  }

  async getFPS(filePath: string): Promise<number> {
    const data = await this.ffprobe(filePath);

    const videoStream = data.streams.find(
      (stream) => stream.codec_type === "video"
    );

    if (!videoStream) throw new Error("No video stream found");

    return eval(videoStream.avg_frame_rate ?? "");
  }
}
