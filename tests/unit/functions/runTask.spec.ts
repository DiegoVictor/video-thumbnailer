import createEvent from 'aws-event-mocks';
import { Context } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { runTask } from '@functions/runTask/handler';

const mockEcs = {
  runTask: jest.fn(),
};
jest.mock('@aws-sdk/client-ecs', () => {
  return {
    ECS: function FakeECS() {
      return mockEcs;
    },
  };
});

describe('runTask', () => {
  it('should be able to run task', async () => {
    const event = createEvent({
      template: 'aws:s3',
      merge: {
        Records: [
          {
            eventName: 'ObjectCreated:Put',
            s3: {
              bucket: {
                name: 'bucket-name',
              },
              object: {
                key: `videos/${randomUUID()}.mp4`,
              },
            },
          },
        ],
      },
    });

    const callback = jest.fn();

    await runTask(event, {} as Context, callback);

    expect(mockEcs.runTask).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, 'Success');
  });

  it('should not be able to run task', async () => {
    const event = createEvent({
      template: 'aws:s3',
      merge: {
        Records: [
          {
            eventName: 'ObjectCreated:Put',
            s3: {
              bucket: {
                name: 'bucket-name',
              },
              object: {
                key: `videos/${randomUUID()}.mp4`,
              },
            },
          },
        ],
      },
    });

    const callback = jest.fn();

    const error = new Error('Test Error');
    mockEcs.runTask.mockReturnValueOnce(
      new Promise(() => {
        throw error;
      })
    );

    await runTask(event, {} as Context, callback);

    expect(mockEcs.runTask).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(error, 'Failed');
  });
});
