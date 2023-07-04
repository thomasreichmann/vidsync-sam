import { S3 } from "@aws-sdk/client-s3";
import { anything, instance, mock, when } from "@typestrong/ts-mockito";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import Stream from "stream";
import S3Service from "./s3Service.js";

chai.use(chaiAsPromised);
const { expect } = chai;
describe("S3Service", () => {
  let s3Service: S3Service;
  let s3ClientMock: S3;
  let fsMock: typeof fs;

  beforeEach(() => {
    // Mock S3Client
    s3ClientMock = mock<S3>();
    fsMock = mock<typeof fs>();
    s3Service = new S3Service("bucketName", instance(s3ClientMock), fsMock);
  });

  it("should list objects", async () => {
    // Arrange
    const prefix = "prefix";
    const mockResponse = { Contents: ["object1", "object2"], $metadata: {} };

    // Mock s3Client.send method to return our mockResponse
    when(s3ClientMock.send(anything())).thenResolve(mockResponse);

    // Act
    const result = await s3Service.list(prefix);

    // Assert
    expect(result).to.deep.equal(mockResponse);
  });

  // Add more tests for upload and download methods
  it("should upload a file to s3", async () => {
    // Arrange
    const filePath = "filePath";
    const mockResponse = { Contents: ["object1", "object2"], $metadata: {} };
    const stubStream = Stream.Readable.from([""]) as fs.ReadStream;

    // Mock s3Client.send method to return our mockResponse
    when(s3ClientMock.send(anything())).thenResolve(mockResponse);

    // Mock fs to return stub stream
    when(fsMock.createReadStream(filePath)).thenReturn(stubStream);

    // Act
    const result = await s3Service.upload(filePath);

    // Assert
    expect(result).to.deep.equal(mockResponse);
  });
});
