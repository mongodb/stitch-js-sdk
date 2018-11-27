[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# MongoDB Stitch Server SDK 

The official [MongoDB Stitch](https://stitch.mongodb.com/) Server SDK for JavaScript/TypeScript.

### Index
- [Documentation](#documentation)
- [Discussion](#discussion)
- [Installation](#installation)
- [Example Usage](#example-usage)

## Documentation
* [API/Typedoc Documentation](https://s3.amazonaws.com/stitch-sdks/js-server/docs/4.1.0/index.html)
* [MongoDB Stitch Documentation](https://docs.mongodb.com/stitch/)

## Discussion
* [MongoDB Stitch Users - Google Group](https://groups.google.com/d/forum/mongodb-stitch-users)
* [MongoDB Stitch Announcements - Google Group](https://groups.google.com/d/forum/mongodb-stitch-announce)

## Installation

### NPM

Run the following in the root directory of your NPM project.

```bash
npm install mongodb-stitch-server-sdk
```

This will start you off with the core SDK functionality as well as the remote MongoDB service.

For customized dependencies use the following:

```bash
npm install mongodb-stitch-server-core
npm install mongodb-stitch-server-services-aws
npm install mongodb-stitch-server-services-http
npm install mongodb-stitch-server-services-mongodb-remote
npm install mongodb-stitch-server-services-twilio
```

## Example Usage

### Creating a new app with the SDK (NPM)

#### Set up an application on Stitch
1. Go to [https://stitch.mongodb.com/](https://stitch.mongodb.com/) and log in to MongoDB Atlas.
2. Create a new app in your project with your desired name.
3. Go to your app in Stitch via Atlas by clicking Stitch Apps in the left side pane and clicking your app.
3. Copy your app's client app id by going to Clients on the left side pane and clicking copy on the App ID section.
4. Go to Providers from Users in the left side pane and edit and enable "Allow users to log in anonymously".

#### Set up an NPM project
1. Ensure that you have `npm` installed. See [npmjs.com](https://www.npmjs.com).
2. Initialize a new NPM project with `npm init`.
3. Add the MongoDB Stitch Server SDK by running `npm install mongodb-stitch-server-sdk`.
4. Create directories for your source files:

```bash
mkdir src
```

5. Create the file `src/index.js` and add the following code, replacing `<your-client-app-id>` with the id you retrieved when setting up the application in MongoDB Stitch:

```javascript
const { 
    Stitch, 
    AnonymousCredential,
} = require('mongodb-stitch-server-sdk');

const client = Stitch.initializeDefaultAppClient('<your-client-app-id>');
client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
    console.log(user);
    client.close();
}).catch(err => {
    console.log(err);
    client.close();
})
```

6. Run the app by running `node src/index.js`.

### Using the SDK

#### Initialize the SDK
1. When your app has started, run the following code to initialize the Stitch SDK, replacing `<your-client-app-id>` with your Stitch application's client app ID:

```javascript
const { Stitch, AnonymousCredential } = require('mongodb-stitch-server-sdk');

Stitch.initializeDefaultAppClient('<your-client-app-id>');
```

2. To get a client to use for logging in and communicating with Stitch, use `Stitch.defaultAppClient`

```javascript
const stitchClient = Stitch.defaultAppClient;
```

#### Logging In
1. We enabled anonymous log in, so let's log in with it; add the following anywhere in your code:

```javascript
const client = Stitch.defaultAppClient;

console.log("logging in anonymously");
client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
  console.log(`logged in anonymously as user ${user.id}`)
});
```

2. When running this code, you should see the following in your standard out:

```
logging in anonymously                                                    	
logged in anonymously as user 58c5d6ebb9ede022a3d75050
```

#### Executing a function
1. Once logged in, executing a function happens via the `StitchAppClient`'s `callFunction()` method

```javascript
client.callFunction("echoArg", ["Hello world!"]).then(echoedResult => {
  console.log(`Echoed result: ${echoedResult}`);
})
```

2. If you've configured your Stitch application to have a function named "echoArg" that returns its argument, you should see a message like:

```
Echoed result: Hello world!
```
	
#### Getting a StitchAppClient without Stitch.getDefaultAppClient

In the case that you don't want a single default initialized `StitchAppClient`, you can use the following with as many client app IDs as you'd like to initialize clients for multiple app IDs:

```javascript
const client = Stitch.initializeAppClient("<your-client-app-id>");
```

You can use the client returned there or anywhere else in your app by using the following:

```javascript
const client = Stitch.getAppClient("<your-client-app-id>");
```

#### Changing the default data directory

Clients will generally store their data in `$HOME/.stitch/<your-client-app-id>`. To modify this directory, you must initialize an app client with a custom data directory set:

```javascript
const { Stitch, StitchAppClientConfiguration } = require('mongodb-stitch-server-sdk');

const client = Stitch.initializeAppClient("<your-client-app-id>", new StitchAppClientConfiguration.Builder().withDataDirectory('/some/path').build());
```

You can use the client returned there or anywhere else in your app by using the following:

```javascript
const client = Stitch.getAppClient("<your-client-app-id>");
```

#### Closing the StitchAppClient

The client maintains some background processes in the event loop that must be shutdown when the client is no longer needed. Simply call `close` on the client when you are done with the client:

```javascript
client.close();
```
