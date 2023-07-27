import { anything, instance, mock, when } from "@typestrong/ts-mockito";
import { expect } from "chai";
import { describe } from "mocha";
import path from "path";
import DownloadService, { DownloadError } from "../services/downloadService.js";
import S3Service from "../services/s3Service.js";

describe("DownloadService Tests", () => {
  let s3ServiceMock: S3Service;

  let downloadService: DownloadService;

  beforeEach(() => {
    s3ServiceMock = mock<S3Service>();
    downloadService = new DownloadService(instance(s3ServiceMock));
  });

  it("should download video from s3", async () => {
    const key = "TEST-KEY";
    const outputDir = "TEST-OUTPUT-DIR";

    when(s3ServiceMock.download(key, outputDir)).thenResolve(
      path.join(outputDir, key)
    );

    const result = await downloadService.download(key, outputDir);

    expect(result).to.equal(path.join(outputDir, key));
  });

  it("should throw an error if download fails", async () => {
    when(s3ServiceMock.download(anything(), anything())).thenReject();

    try {
      await downloadService.download("key", "outputDir");
    } catch (err) {
      expect(err).to.be.of.instanceOf(DownloadError);
    }
  });
});
