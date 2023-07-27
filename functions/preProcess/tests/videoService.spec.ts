import { expect } from "chai";
import VideoService from "../services/videoService.js";

describe("DownloadService Tests", () => {
  let videoService: VideoService;

  beforeEach(() => {
    videoService = new VideoService();
  });

  it("should normalize video with ffmpeg", async () => {
    const inputPath = "TEST-INPUT-PATH";
    const outputPath = "TEST-OUTPUT-PATH";

    // Mock getFPS to return a predefined value
    videoService.getFPS = async () => 50;

    // Mock executeCommand to do nothing (since it's the final execution step)
    videoService.executeCommand = async () => {};

    const result = await videoService.normalize(inputPath, outputPath);

    expect(result).to.equal(outputPath);
  });

  it("should throw an error if getFPS fails", async () => {
    // Mock getFPS to throw an error
    videoService.getFPS = async () => {
      throw new Error();
    };

    try {
      await videoService.normalize("inputPath", "outputPath");
    } catch (err) {
      expect(err).to.be.of.instanceOf(Error);
    }
  });
});
