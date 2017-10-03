const stitch = require('../src');

export async function getAuthenticatedClient(apiKey) {
  const adminClient = new stitch.Admin('http://localhost:7080');
  await adminClient.client.authenticate('apiKey', apiKey);
  return adminClient;
}
