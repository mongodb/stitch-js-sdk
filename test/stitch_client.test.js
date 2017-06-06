const stitch = require('../src');

describe('StitchClient', () => {
  it('should not allow calls to `service` as a constructor', () => {
    expect(() => {
      let client = new stitch.StitchClient();
      let service = new client.service('mongodb', 'mdb1');  // eslint-disable-line
    }).toThrow();
  });

  it('should allow a single stage to be passed in to `executePipeline`', () => {
    const stage = {
      $pipeline: {
        name: 'createGroup',
        args: {
          groupName: 'dummy'
        }
      }
    };

    let client = new stitch.StitchClient();
    client._do = () => { return Promise.resolve({ text: () => 'true' }); }; // stub out fetch call
    return client.executePipeline(stage);
  });
});
