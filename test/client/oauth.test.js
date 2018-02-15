const path = require('path');
const express = require('express');

require('chromedriver');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

// Returns true if Facebook credentials are in env, false otehrwise.
function facebookCredsInEnv() {
  return !!(process.env.FB_APP_ID && process.env.FB_APP_SECRET);
}

describe('Logging in with OAuth2 Providers', () => {
  const test = new StitchMongoFixture();

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  let th;
  let server;
  let driver;

  beforeEach(async() => {
    // Start simple web app that contains UI elements for OAuth flow
    let app = express();
    app.use(express.static(path.resolve(__dirname, '..', '..', 'dist', 'web')));
    app.use(express.static(path.resolve(__dirname, 'static')));
    server = app.listen(8005);

    // Set up Chrome to run headlessly
    const chromeCapabilities = webdriver.Capabilities.chrome();
    chromeCapabilities.set('chromeOptions', {
      args: ['--headless', '--disable-gpu', '--window-size=1280,800', '--no-sandbox'],
      binary: process.platform === 'darwin' ?
        '/Applications/Google Chrome.app/Contents/MacOS/Google\ Chrome' :
        '/usr/bin/google-chrome-stable'
    });

    // Start headless chrome
    driver = new webdriver.Builder()
      .forBrowser('chrome')
      .withCapabilities(chromeCapabilities)
      .build();

    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);

    if (facebookCredsInEnv()) {
      await th
        .app()
        .authProviders()
        .create({
          type: 'oauth2-facebook',
          config: {
            clientId: process.env.FB_APP_ID,
            clientSecret: process.env.FB_APP_SECRET
          },
          'disabled': false,
          redirect_uris: ['http://localhost:8005/oauth_test.html']
        });
    }
  });

  afterEach(async() => {
    driver.quit();
    server.close();
    await th.cleanup();
  });

  it('should successfully authenticate using Facebook', async() => {
    if (!facebookCredsInEnv()) {
      console.warn('skipping test since there are no Facebook credentials in environment');
      return;
    }

    // Allow 30 seconds for test to complete
    jest.setTimeout(30000);

    // Log in to Facebook
    await driver.get('http://www.facebook.com/');
    await driver.findElement(By.id('email')).sendKeys('yzbpjkilbl_1518469485@tfbnw.net');
    await driver.findElement(By.id('pass')).sendKeys('hunter2');
    await driver.findElement(By.id('loginbutton')).click();
    await driver.sleep(3000);

    // Go to Stitch app
    await driver.get('http://localhost:8005/oauth_test.html');

    // initialize the StitchClient
    await driver.findElement(By.id('client-app-id-input')).sendKeys(th.testApp.client_app_id);
    await driver.sleep(200);
    await driver.findElement(By.id('init-stitch-button')).click();
    await driver.sleep(200);

    // Start the OAuth flow and wait about three seconds
    await driver.findElement(By.id('fb-oauth-button')).click();
    await driver.sleep(3000);

    // reinitialize the StitchClient
    await driver.findElement(By.id('client-app-id-input')).sendKeys(th.testApp.client_app_id);
    await driver.sleep(200);
    await driver.findElement(By.id('init-stitch-button')).click();
    await driver.sleep(200);
    await driver.findElement(By.id('update-auth-status-button')).click();
    await driver.sleep(200);

    // Check that the authed user is authed with the Facebook provider
    let authStatusElem = await driver.findElement(By.id('auth-status'));
    expect(await authStatusElem.getText()).toEqual('oauth2-facebook');
  });
});
