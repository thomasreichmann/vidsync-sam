import { S3 } from "@aws-sdk/client-s3";
import { expect } from "chai";
import { anything, instance, mock, when } from "ts-mockito";
import S3Service from "./s3Service";

describe("S3Service", () => {
  let s3Service: S3Service;
  let s3ClientMock: S3;

  beforeEach(() => {
    // Mock S3Client
    s3ClientMock = mock<S3>();
    s3Service = new S3Service("bucketName", instance(s3ClientMock));
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
});
