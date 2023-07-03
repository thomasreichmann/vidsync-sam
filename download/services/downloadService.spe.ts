import { expect } from "chai";
import fs from "fs";
import fetch, { Response } from "node-fetch";
import Stream from "stream";
import { anything, instance, mock, when } from "ts-mockito";
import DownloadService, { DownloadError, SaveError } from "./downloadService";

describe("DownloadService", () => {
  let downloadService: DownloadService;
  let fsMock: typeof fs;
  let fetchMock: typeof fetch;
  let responseMock: Response;

  beforeEach(() => {
    // Mock fetch and fs
    fetchMock = mock<typeof fetch>();
    fsMock = mock<typeof fs>();
    responseMock = mock<Response>();
    downloadService = new DownloadService(fetch, fs);
  });

  it("should download data", async () => {
    // Arrange
    const url = "http://test.com/file.mp4";
    const body = new Stream.Readable() as NodeJS.ReadableStream;
    when(fetchMock(url)).thenResolve(instance(responseMock));
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
    when(fetchMock(url)).thenResolve(instance(responseMock));
    when(responseMock.ok).thenReturn(false);
    when(responseMock.statusText).thenReturn("Not Found");

    // Act & Assert
    expect(await downloadService.get(url)).to.throw(DownloadError);
  });

  it("should save data to a file", async () => {
    // Arrange
    const url = "file.mp4";
    const stream = new Stream.Readable();
    const writeStream = new Stream.Writable();
    when(fsMock.createWriteStream(anything())).thenReturn(writeStream as any);

    // Act
    const result = await downloadService.save(url, stream);

    // Assert
    expect(result).to.equal(url);
  });

  it("should throw SaveError if there is an error while saving the file", async () => {
    // Arrange
    const url = "file.mp4";
    const stream = new Stream.Readable();
    const writeStream = new Stream.Writable();
    when(fsMock.createWriteStream(anything())).thenReturn(writeStream as any);
    writeStream.on("error", (err) => new SaveError(err.message));

    // Act & Assert
    expect(await downloadService.save(url, stream)).to.throw(SaveError);
  });
});
