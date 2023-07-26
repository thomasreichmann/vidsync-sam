import { expect } from "chai";
import { describe } from "mocha";
import DownloadService from "../services/downloadService.js";

describe("preProcess", () => {
  it("should pass", async () => {
    const downloadService = new DownloadService();

    const result = downloadService.get("title");

    expect(result).to.equal("Downloading title...");
  });
});
