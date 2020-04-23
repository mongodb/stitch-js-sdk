import { RealmError } from '../src/Errors';

describe('RealmError', () => {
  it('reports a full stack trace', () => {
    const err = new RealmError('Oh noes!');
    expect(err.toString()).toEqual('RealmError: Oh noes!');
    expect(err.stack?.length).toBeGreaterThan(err.toString().length);
  });
});
