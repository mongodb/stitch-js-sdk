[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# MongoDB Stitch Server SDK 

The official [MongoDB Stitch](https://www.mongodb.com/cloud/stitch) Server SDK for JavaScript/TypeScript.

## Index
- [Documentation](#documentation)
- [Discussion](#discussion)
- [Installation](#installation)
- [Getting Started](#getting-started)

## Documentation
* [MongoDB Stitch Documentation](https://docs.mongodb.com/stitch/)
* [API Reference Manual](https://docs.mongodb.com/stitch-sdks/js-server/4/index.html)

## Discussion
* [MongoDB Stitch Users - Google Group](https://groups.google.com/d/forum/mongodb-stitch-users)
* [MongoDB Stitch Announcements - Google Group](https://groups.google.com/d/forum/mongodb-stitch-announce)

## Installation

### NPM

Run the following in the root directory of your NPM project.

```bash
npm install mongodb-stitch-server-sdk
```

This will start you off with the [core SDK functionality](classes/stitch.html) as well as the [remote MongoDB service](modules/remotemongoclient.html).

See [Customized Dependencies (Advanced)](#customized-dependencies) below for customizing dependencies.

## Getting Started

### Creating a new app with the SDK (NPM)

#### Set up an application on Stitch

First, you need to create the server-side Stitch app, and (for the purpose of this quick start) enable anonymous authentication:

1. Go to [https://stitch.mongodb.com/](https://stitch.mongodb.com/) and log in to MongoDB Atlas.
2. Create a new app in your project with your desired name.
3. Go to your app in Stitch via Atlas by clicking Stitch Apps in the left side pane and clicking your app.
4. Copy your app's client app id by going to Clients on the left side pane and clicking copy on the App ID section.
5. Go to Providers from Users in the left side pane and edit and enable "Allow users to log in anonymously".

For detailed instructions, see [Create a Stitch App](https://docs.mongodb.com/stitch/procedures/create-stitch-app/).

#### Set up an NPM project

Next, you create the source for your client app.

1. Ensure that you have `npm` installed. See [npmjs.com](https://www.npmjs.com).
2. Initialize a new NPM project: 

```bash
mkdir StitchProject && cd StitchProject
npm init
```

3. Add the MongoDB Stitch Server SDK:

```bash
npm install mongodb-stitch-server-sdk
```

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

When your app has started, use [Stitch.initializeDefaultAppClient](classes/stitch.html#initializedefaultappclient) to initialize the Stitch SDK. Replace `<your-client-app-id>` with your Stitch application's client app ID:

```javascript
const { Stitch, AnonymousCredential } = require('mongodb-stitch-server-sdk');

Stitch.initializeDefaultAppClient('<your-client-app-id>');
```

Your client app ID can be found in the [Stitch UI](https://stitch.mongodb.com).

#### Logging In

We enabled [anonymous authentication](https://docs.mongodb.com/stitch/authentication/anonymous/) in the steps above, so let's log in with it! Add the following anywhere in your code:

```javascript
const client = Stitch.defaultAppClient;

console.log("logging in anonymously");
client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
  console.log(`logged in anonymously as user ${user.id}`)
});
```

When running this code, you should see the following in your standard out:

```
logging in anonymously                                                    	
logged in anonymously as user 58c5d6ebb9ede022a3d75050
```

See [StitchAuth](interfaces/stitchauth.html) for more information.


#### Executing a Stitch Function

One of Stitch's powerful features is serverless [Functions](https://docs.mongodb.com/stitch/functions/). Once logged in, the Stitch client can execute remote Stitch Functions using the [StitchAppClient.callFunction](interfaces/stitchappclient.html#callfunction) method:

```javascript
client.callFunction("echoArg", ["Hello world!"]).then(echoedResult => {
  console.log(`Echoed result: ${echoedResult}`);
})
```

Assuming you've configured your Stitch application to have a Function named "echoArg" that returns its argument, you should see a message like:

```
Echoed result: Hello world!
```

The `echoArg` Function in Stitch would look something like:

```javascript
// echoArg Function in the Stitch UI
exports = function(arg) {
  return {arg: arg};
};
```

#### Using BSON and Extended JSON

As a convenience, the SDK includes the [bson](https://www.npmjs.com/package/bson) library. You can import it as you would import other classes and values from the SDK.

Here is an example of importing BSON to generate a BSON `ObjectID`:

```javascript
const { BSON } = require('mongodb-stitch-server-sdk');

let myObjectId = new BSON.ObjectId();
console.log(`Generated ObjectId: ${myObjectId}`);
```

## Advanced Topics

#### Customized Dependencies

For customized dependencies, use the following:

```bash
npm install mongodb-stitch-server-core
npm install mongodb-stitch-server-services-aws
npm install mongodb-stitch-server-services-http
npm install mongodb-stitch-server-services-mongodb-remote
npm install mongodb-stitch-server-services-twilio
```

#### Getting a StitchAppClient without Stitch.getDefaultAppClient (Advanced)

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
