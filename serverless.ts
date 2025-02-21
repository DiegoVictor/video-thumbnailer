import type { AWS } from '@serverless/typescript';

import signedUrl from '@functions/signedURL';
import runTask from '@functions/runTask';

const serverlessConfiguration: AWS = {
  service: 'video-thumbnailer',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
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
                [
                  {
                    'Fn::GetAtt': ['VideoThumbnailerBucket', 'Arn'],
                  },
                  '/*',
                ],
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
    runTask,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
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
      VideoThumbnailerECSCluster: {
        Type: 'AWS::ECS::Cluster',
        Properties: {
          ClusterName: 'VideoThumbnailer',
          CapacityProviders: ['FARGATE', 'FARGATE_SPOT'],
        },
      },
      VideoThumbnailerContainerRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: '',
                Effect: 'Allow',
                Principal: {
                  Service: 'ecs-tasks.amazonaws.com',
                },
                Action: 'sts:AssumeRole',
              },
            ],
          },
          Policies: [
            {
              PolicyName: 'VideoThumbnailerPermissions',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: [
                      'ecr:GetAuthorizationToken',
                      'ecr:BatchCheckLayerAvailability',
                      'ecr:GetDownloadUrlForLayer',
                      'ecr:BatchGetImage',
                      'logs:CreateLogStream',
                      'logs:PutLogEvents',
                      'logs:CreateLogGroup',
                      's3:GetObject',
                      's3:PutObject',
                    ],
                    Resource: '*',
                  },
                ],
              },
            },
          ],
        },
      },
      VideoThumbnailerTaskDefinition: {
        Type: 'AWS::ECS::TaskDefinition',
        Properties: {
          Cpu: '256',
          Memory: '512',
          NetworkMode: 'awsvpc',
          ExecutionRoleArn: {
            'Fn::GetAtt': ['VideoThumbnailerContainerRole', 'Arn'],
          },
          TaskRoleArn: {
            'Fn::GetAtt': ['VideoThumbnailerContainerRole', 'Arn'],
          },
          RequiresCompatibilities: ['FARGATE'],
          ContainerDefinitions: [
            {
              Name: '${self:custom.containerName}',
              Image:
                '${aws:accountId}.dkr.ecr.${opt:region, self:provider.region, "us-east-1"}.amazonaws.com/video-thumbnailer',
              Essential: true,
              Environment: [
                {
                  Name: 'BUCKET_NAME',
                  Value: '${self:custom.bucketName}',
                },
              ],
              LogConfiguration: {
                LogDriver: 'awslogs',
                Options: {
                  'awslogs-create-group': true,
                  'awslogs-group': 'video-thumbnailer-container',
                  'awslogs-region':
                    '${opt:region, self:provider.region, "us-east-1"}',
                  'awslogs-stream-prefix': 'video-thumbnailer',
                },
              },
            },
          ],
        },
      },
      VideoThumbnailerVpc: {
        Type: 'AWS::EC2::VPC',
        Properties: {
          CidrBlock: '10.0.0.0/16',
          EnableDnsHostnames: true,
          EnableDnsSupport: true,
        },
      },
      VideoThumbnailerSubnet1: {
        Type: 'AWS::EC2::Subnet',
        Properties: {
          CidrBlock: '10.0.0.0/24',
          AvailabilityZone: 'us-east-1a',
          VpcId: {
            Ref: 'VideoThumbnailerVpc',
          },
        },
      },
      VideoThumbnailerSubnet2: {
        Type: 'AWS::EC2::Subnet',
        Properties: {
          CidrBlock: '10.0.1.0/24',
          AvailabilityZone: 'us-east-1b',
          VpcId: {
            Ref: 'VideoThumbnailerVpc',
          },
        },
      },
      VideoThumbnailerInternetGateway: {
        Type: 'AWS::EC2::InternetGateway',
      },
      VideoThumbnailerGatewayAttachment: {
        Type: 'AWS::EC2::VPCGatewayAttachment',
        Properties: {
          InternetGatewayId: {
            'Fn::GetAtt': [
              'VideoThumbnailerInternetGateway',
              'InternetGatewayId',
            ],
          },
          VpcId: {
            Ref: 'VideoThumbnailerVpc',
          },
        },
      },
      VideoThumbnailerRouteTable: {
        Type: 'AWS::EC2::RouteTable',
        Properties: {
          VpcId: {
            Ref: 'VideoThumbnailerVpc',
          },
        },
      },
      VideoThumbnailerRoute: {
        Type: 'AWS::EC2::Route',
        DependsOn: ['VideoThumbnailerInternetGateway'],
        Properties: {
          RouteTableId: { Ref: 'VideoThumbnailerRouteTable' },
          DestinationCidrBlock: '0.0.0.0/0',
          GatewayId: {
            'Fn::GetAtt': [
              'VideoThumbnailerInternetGateway',
              'InternetGatewayId',
            ],
          },
        },
      },
      VideoThumbnailerSubnetTableAssociation1: {
        Type: 'AWS::EC2::SubnetRouteTableAssociation',
        Properties: {
          RouteTableId: { Ref: 'VideoThumbnailerRouteTable' },
          SubnetId: { Ref: 'VideoThumbnailerSubnet1' },
        },
      },
      VideoThumbnailerSubnetTableAssociation2: {
        Type: 'AWS::EC2::SubnetRouteTableAssociation',
        Properties: {
          RouteTableId: { Ref: 'VideoThumbnailerRouteTable' },
          SubnetId: { Ref: 'VideoThumbnailerSubnet2' },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
