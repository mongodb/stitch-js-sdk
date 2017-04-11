const baas = require('../src');

describe('BaasClient', () => {
  it('should not allow calls to `service` as a constructor', () => {
    expect(() => {
      let client = new baas.BaasClient();
      let service = new client.service('mongodb', 'mdb1');  // eslint-disable-line
    }).toThrow();
  });
});
