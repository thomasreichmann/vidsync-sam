import { expect } from "chai";
import * as fs from "node:fs/promises";
import path from "node:path";
import VideoService from "../../services/videoService.js";

describe("normalize integration test", () => {
  let videoService: VideoService;

  beforeEach(() => {
    videoService = new VideoService();
  });

  it("should normalize video with ffmpeg integration", async () => {
    const clipsPath = `${process.cwd()}/clips`;
    let files = await fs.readdir(clipsPath);

    let file = files[0];

    fs.mkdir(path.join(clipsPath, "normalized"));

    let out = await videoService.normalize(
      path.join(clipsPath, file),
      path.join(clipsPath, "normalized", file)
    );

    fs.unlink(out);
    fs.rmdir(path.join(clipsPath, "normalized"));

    expect(out).to.equal(path.join(clipsPath, "normalized", file));
  });
});
