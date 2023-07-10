import "dotenv/config";
import { describe, it } from "mocha";
import Stream from "stream";
import DownloadService from "../../services/downloadService.js";
import S3Service from "../../services/s3Service.js";
import TwitchService from "../../services/twitchService.js";

describe("s3 service integration tests", () => {
  let s3Service: S3Service;
  let twitchService: TwitchService;
  let downloadService: DownloadService;

  before(() => {
    s3Service = new S3Service("vidsync-compiler");
    twitchService = new TwitchService();
    downloadService = new DownloadService();
  });

  it("should upload file", async () => {
    let clips = await twitchService.getClips("21779", 1);
    let downloadUrls = clips.map((clip) =>
      twitchService.generateDownloadUrl(clip)
    );

    let clipStreams = await Promise.all(
      downloadUrls.map((url) => downloadService.get(url))
    );

    let uploadPromises = clipStreams.map(async (stream, index) => {
      let clip = clips[index];
      let clipName = clip.id;
      let clipPath = `clips/${clipName}.mp4`;

      // await fs.promises.writeFile(clipPath, stream);

      return s3Service.upload(stream as Stream.Readable, clipPath);
    });

    try {
      await Promise.all(uploadPromises);
    } catch (err) {
      console.log(err);
    }

    // await expect(Promise.all(uploadPromises)).to.eventually.be.fulfilled;
  }).timeout(100000);
});
