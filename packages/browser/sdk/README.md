[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# MongoDB Stitch Browser SDK 

The official [MongoDB Stitch](https://stitch.mongodb.com/) Browser SDK for JavaScript/TypeScript.

### Index
- [Documentation](#documentation)
- [Discussion](#discussion)
- [Installation](#installation)
- [Example Usage](#example-usage)

## Documentation
* [API/Typedoc Documentation](https://s3.amazonaws.com/stitch-sdks/js/docs/4.0.7/index.html)
* [MongoDB Stitch Documentation](https://docs.mongodb.com/stitch/)

## Discussion
* [MongoDB Stitch Users - Google Group](https://groups.google.com/d/forum/mongodb-stitch-users)
* [MongoDB Stitch Announcements - Google Group](https://groups.google.com/d/forum/mongodb-stitch-announce)

## Installation

### NPM

Run the following in the root directory of your NPM project.

```bash
npm install mongodb-stitch-browser-sdk
```

This will start you off with the core SDK functionality as well as the remote MongoDB service.

For customized dependencies use the following:

```bash
npm install mongodb-stitch-browser-core
npm install mongodb-stitch-browser-services-aws-s3
npm install mongodb-stitch-browser-services-aws-ses
npm install mongodb-stitch-browser-services-http
npm install mongodb-stitch-browser-services-mongodb-remote
npm install mongodb-stitch-browser-services-twilio
```

### HTML Script Tags

You can also include the SDK directly in your HTML code using script tags. For core SDK functionality and the remote MongoDB service, use the following:

```html
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch.js"></script>
```

For customized dependencies use the following:
```html
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch-core.js"></script>
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch-services-aws-s3.js"></script>
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch-services-aws-ses.js"></script>
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch-services-http.js"></script>
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch-services-mongodb-remote.js"></script>
<script src="https://s3.amazonaws.com/stitch-sdks/js/bundles/4.0.7/stitch-services-twilio.js"></script>
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
3. Add the MongoDB Stitch Browser SDK by running `npm install mongodb-stitch-browser-sdk`.
4. Install `webpack.js` by running `npm install --save-dev webpack webpack-cli`.
5. Add the following field to the `"scripts"` field of your `package.json`:

```json
"scripts": {
    "pack": "webpack"
}
```

6. Create directories for your source files, and your distributed files:

```bash
mkdir src dist
```

7. Create the file `src/index.js` and add the following code, replacing `<your-client-app-id>` with the id you retrieved when setting up the application in MongoDB Stitch:

```javascript
import { Stitch, AnonymousCredential } from 'mongodb-stitch-browser-sdk'

function initializeAndLogin() {
  const client = Stitch.initializeDefaultAppClient('<your-client-app-id>');
  client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
    document.getElementById('auth-status').innerHTML = 
      `Logged in as anonymous user with id ${user.id}`;
  });
}

window.onload = initializeAndLogin;
```

8. Create the file `dist/index.html` and add the following code:

```html
<!doctype html>
  <html>
   <head>
     <title>MongoDB Stitch Sample</title>
   </head>
   <body>
     <script src="main.js"></script>
     <div id="auth-status">Logged Out</div>
   </body>
  </html>
```

9. Run the webpack bundler by running `npm run pack`.
10. Open `dist/index.html` in your web browser. If everything was configured correctly, you should see a message in the browser window that you are logged in as an anonymous user.

See the [Getting Started](https://webpack.js.org/guides/getting-started/) guide on `webpack`'s website for more information on how to use webpack to bundle your JavaScript or TypeScript code that uses the Stitch SDK.

Additionally, the JavaScript code above utilizes ES6 features. If you'd like your code to run in older browsers, you'll need to use a transpiler like [Babel](https://babeljs.io/) as part of your bundling process. See [babel-loader](https://github.com/babel/babel-loader).

### Using the SDK

#### Initialize the SDK
1. When your app or webpage is initialized, run the following code to initialize the Stitch SDK, replacing `<your-client-app-id>` with your Stitch application's client app ID:

```javascript
import { Stitch, AnonymousCredential } from 'mongodb-stitch-browser-sdk'

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

2. When running this code, you should see the following in your browser's debug console:

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
