import { StitchError } from '../src/errors';

describe('StitchError', () => {
  it('reports a full stack trace', () => {
    const err = new StitchError('Oh noes!');
    expect(err.toString()).toEqual('StitchError: Oh noes!');
    expect(err.stack.length).toBeGreaterThan(err.toString().length);
  });
});
