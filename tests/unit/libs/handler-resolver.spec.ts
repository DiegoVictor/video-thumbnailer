import { handlerPath } from '@libs/handler-resolver';

describe('handlerResolver', () => {
  it('should be able to resolve path', async () => {
    expect(handlerPath(__dirname)).toBe('tests/unit/libs');
  });
});
