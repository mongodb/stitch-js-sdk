const { StitchClient } = require('./dist/node/index').default;

const client = new StitchClient('blah');

client.authManager.localAuth().catch(err => console.log('error: ', err));
client.authManager.apiKeyAuth().catch(err => console.log(err));
client.authManager.mongodbCloudAuth().catch(err => console.log(err));

// client.userProfile().then(blah => console.log(blah));

