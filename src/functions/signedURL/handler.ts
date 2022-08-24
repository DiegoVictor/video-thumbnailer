import { APIGatewayProxyEvent, Handler } from 'aws-lambda';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export const signedUrl: Handler<APIGatewayProxyEvent> = async () => {
  const s3 = new S3({});
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `videos/${randomUUID()}.mp4`,
    }),
    {
      expiresIn: 900,
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      signedUrl: url,
    }),
  };
};
