import { Handler, S3Event } from 'aws-lambda';
import { ECS } from '@aws-sdk/client-ecs';

export const runTask: Handler<S3Event> = async (event, _, callback) => {
  try {
    const ecs = new ECS({});

    await Promise.all(
      event.Records.map((record) =>
        ecs.runTask({
          taskDefinition: process.env.TASK_DEFINITION,
          cluster: process.env.CLUSTER_NAME,
          launchType: 'FARGATE',
          networkConfiguration: {
            awsvpcConfiguration: {
              assignPublicIp: 'ENABLED',
              subnets: [process.env.SUBNET1_ID, process.env.SUBNET2_ID],
            },
          },
          overrides: {
            containerOverrides: [
              {
                name: process.env.CONTAINER_NAME,
                environment: [
                  {
                    name: 'VIDEO_PATH',
                    value: record.s3.object.key,
                  },
                ],
              },
            ],
          },
        })
      )
    );

    callback(null, 'Success');
  } catch (error) {
    callback(error, 'Failed');
  }
};
