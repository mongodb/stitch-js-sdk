const stitch = require('../src');
const constants = require('./constants');

export async function getAuthenticatedClient(apiKey, serverUrl) {
  const adminClient = new stitch.Admin(serverUrl || constants.DEFAULT_SERVER_URL);
  await adminClient.authenticate('apiKey', apiKey);
  return adminClient;
}
