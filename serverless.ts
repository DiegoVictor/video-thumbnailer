import type { AWS } from '@serverless/typescript';

import signedUrl from '@functions/signedURL';
const serverlessConfiguration: AWS = {
  service: 'video-thumbnailer',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject'],
            Resource: {
              'Fn::Join': [
                '',
                [{ 'Fn::GetAtt': ['VideoThumbnailerBucket', 'Arn'] }, '/*'],
              ],
            },
          },
          {
            Effect: 'Allow',
            Action: ['ecs:RunTask'],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: ['iam:PassRole'],
            Resource: {
              'Fn::GetAtt': ['VideoThumbnailerContainerRole', 'Arn'],
            },
          },
        ],
      },
    },
  },
  functions: {
    signedUrl,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    bucketName: 'video-thumbnailer-${sls:stage}',
    containerName: 'video-thumbnailer',
  },
  resources: {
    Resources: {
      VideoThumbnailerBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.bucketName}',
        },
      },
      VideoThumbnailerRepository: {
        Type: 'AWS::ECR::Repository',
        Properties: {
          RepositoryName: 'video-thumbnailer',
          ImageScanningConfiguration: {
            ScanOnPush: true,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
