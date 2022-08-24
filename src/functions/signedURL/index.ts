import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.signedUrl`,
  events: [
    {
      http: {
        method: 'get',
        path: 'signedUrl',
      },
    },
  ],
  environment: {
    BUCKET_NAME: '${self:custom.bucketName}',
  },
};
