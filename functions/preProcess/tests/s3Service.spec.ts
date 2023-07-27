import { S3 } from "@aws-sdk/client-s3";
import { anything, instance, mock, when } from "@typestrong/ts-mockito";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import Stream from "stream";
import S3Service, { UploadResult } from "../services/s3Service.js";

chai.use(chaiAsPromised);
const { expect } = chai;

const BUCKET_NAME = "bucketName";

describe("S3Service", () => {
  let s3Service: S3Service;
  let s3ClientMock: S3;
  let fsMock: typeof fs;

  beforeEach(() => {
    // Mock S3Client
    s3ClientMock = mock<S3>();
    fsMock = mock<typeof fs>();
    s3Service = new S3Service(BUCKET_NAME, instance(s3ClientMock), fsMock);
  });

  // Add more tests for upload and download methods
  it("should upload a file to s3", async () => {
    // Arrange
    const filePath = "filePath";

    const expectedServiceResponse: UploadResult = {
      bucket: BUCKET_NAME,
      key: filePath,
      statusCode: 200,
    };

    const mockS3UploadResponse = {
      Contents: ["object1", "object2"],
      $metadata: { httpStatusCode: 200 },
    };

    const stubStream = Stream.Readable.from([""]) as fs.ReadStream;

    // Mock s3Client.send method to return our mockResponse
    when(s3ClientMock.send(anything())).thenResolve(mockS3UploadResponse);

    // Mock fs to return stub stream
    when(fsMock.createReadStream(filePath)).thenReturn(stubStream);

    // Act
    const result = await s3Service.upload(filePath, filePath);

    // Assert
    expect(result).to.deep.equal(expectedServiceResponse);
  });
});
