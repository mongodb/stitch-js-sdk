const stitch = require('../src');

describe('StitchClient', () => {
  it('should not allow calls to `service` as a constructor', () => {
    expect(() => {
      let client = new stitch.StitchClient();
      let service = new client.service('mongodb', 'mdb1');  // eslint-disable-line
    }).toThrow();
  });
});
