import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.runTask`,
  events: [
    {
      s3: {
        existing: true,
        bucket: {
          Ref: 'VideoThumbnailerBucket',
        },
        event: 's3:ObjectCreated:*',
        rules: [
          {
            prefix: 'videos',
          },
          {
            suffix: '.mp4',
          },
        ],
      },
    },
  ],
  environment: {
    TASK_DEFINITION: {
      Ref: 'VideoThumbnailerTaskDefinition',
    },
    CLUSTER_NAME: {
      'Fn::GetAtt': ['VideoThumbnailerECSCluster', 'Arn'],
    },
    CONTAINER_NAME: '${self:custom.containerName}',
    SUBNET1_ID: {
      Ref: 'VideoThumbnailerSubnet1',
    },
    SUBNET2_ID: {
      Ref: 'VideoThumbnailerSubnet2',
    },
  },
};
