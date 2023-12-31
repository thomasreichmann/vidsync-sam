import { anything, instance, mock, when } from "@typestrong/ts-mockito";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import fetch, { Response } from "node-fetch";
import Stream, { PassThrough } from "stream";
import DownloadService, {
  DownloadError,
  SaveError,
} from "../services/downloadService.js";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("DownloadService", () => {
  let downloadService: DownloadService;
  let fsMock: typeof fs;
  let fetchMock: { fetch: typeof fetch };
  let responseMock: Response;

  beforeEach(() => {
    // Mock fetch and fs
    fetchMock = mock<{ fetch: typeof fetch }>();
    fsMock = mock<typeof fs>();
    responseMock = mock<Response>();
    downloadService = new DownloadService(
      instance(fetchMock),
      instance(fsMock)
    );
  });

  it("should download data", async () => {
    // Arrange
    const url = "http://test.com/file.mp4";
    const body = Stream.Readable.from(["test data"]);
    when(fetchMock.fetch(url)).thenResolve(instance(responseMock));

    when(responseMock.ok).thenReturn(true);
    when(responseMock.body).thenReturn(body);

    // Act
    const result = await downloadService.get(url);

    // Assert
    expect(result).to.equal(body);
  });

  it("should throw DownloadError if response is not OK", async () => {
    // Arrange
    const url = "http://test.com/file.mp4";
    when(fetchMock.fetch(url)).thenResolve(instance(responseMock));
    when(responseMock.ok).thenReturn(false);
    when(responseMock.statusText).thenReturn("Not Found");

    await expect(downloadService.get(url)).to.be.rejectedWith(DownloadError);
  });

  it("should throw DownloadError if response body is not available", async () => {
    // Arrange
    const url = "http://test.com/file.mp4";
    when(fetchMock.fetch(url)).thenResolve(instance(responseMock));
    when(responseMock.ok).thenReturn(true);
    when(responseMock.body).thenReturn(null);

    await expect(downloadService.get(url)).to.be.rejectedWith(DownloadError);
  });

  it("should save data to a file", async () => {
    // Arrange
    const url = "file.mp4";
    const stream = Stream.Readable.from(["test data"]);
    const writeStream = new PassThrough();
    when(fsMock.createWriteStream(anything())).thenReturn(writeStream as any);

    // Act
    const result = await downloadService.save(url, stream);

    // Assert
    expect(result).to.equal(url);
  });

  it("should throw SaveError if there is an error while saving the file", async () => {
    // Arrange
    const url = "file.mp4";
    const mockError = new Error("Stream error");
    const stream = Stream.Readable.from(["test data"]);
    const writeStreamMock = new Stream.Writable();

    when(fsMock.createWriteStream(anything())).thenReturn(
      writeStreamMock as fs.WriteStream
    );

    // Emit an error from the mock write stream in the next event loop
    process.nextTick(() => writeStreamMock.emit("error", mockError));

    // Act & Assert
    await expect(downloadService.save(url, stream)).to.be.rejectedWith(
      SaveError
    );
  });
});
