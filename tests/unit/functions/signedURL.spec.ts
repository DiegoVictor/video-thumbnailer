import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { S3 } from '@aws-sdk/client-s3';
import { PutAccountSettingCommand } from '@aws-sdk/client-ecs';

import { signedUrl } from '@functions/signedURL/handler';

const mockS3 = {};
const mockPutObjectCommand = jest.fn();
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3: function FakeS3() {
      return mockS3;
    },
    PutObjectCommand: function FakePutObjectCommand(
      options: PutAccountSettingCommand
    ) {
      return mockPutObjectCommand(options);
    },
  };
});

const mockGetSignedUrl = jest.fn();
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: (
      client: S3,
      command: PutAccountSettingCommand,
      options: Record<string, any>
    ) => mockGetSignedUrl(client, command, options),
  };
});

describe('signedUrl', () => {
  it('should be able to get signed URL', async () => {
    const url = '';

    const command = {
      Bucket: process.env.BUCKET_NAME,
      Key: `videos/${randomUUID()}.mp4`,
    };

    mockPutObjectCommand.mockReturnValue(command);
    mockGetSignedUrl.mockResolvedValueOnce(url);

    const response = await signedUrl(
      {} as APIGatewayProxyEvent,
      {} as Context,
      jest.fn()
    );

    expect(mockPutObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.BUCKET_NAME,
      Key: expect.stringMatching(/videos\/[a-z0-9-]+\.mp4/gi),
    });
    expect(mockGetSignedUrl).toHaveBeenCalledWith(mockS3, command, {
      expiresIn: 900,
    });
    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify({
        signedUrl: url,
      }),
    });
  });
});
