[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# MongoDB Stitch React Native SDK 

The official [MongoDB Stitch](https://stitch.mongodb.com/) React Native SDK for JavaScript/TypeScript.

### Index
- [Documentation](#documentation)
- [Discussion](#discussion)
- [Installation](#installation)
- [Example Usage](#example-usage)

## Documentation
* [API/Typedoc Documentation](https://docs.mongodb.com/stitch-sdks/js-react-native/4.1.0/index.html)
* [MongoDB Stitch Documentation](https://docs.mongodb.com/stitch/)

## Discussion
* [MongoDB Stitch Users - Google Group](https://groups.google.com/d/forum/mongodb-stitch-users)
* [MongoDB Stitch Announcements - Google Group](https://groups.google.com/d/forum/mongodb-stitch-announce)

## Installation

### NPM

Run the following in the root directory of your NPM project.

```bash
npm install mongodb-stitch-react-native-sdk
```

This will start you off with the core SDK functionality as well as the remote MongoDB service.

For customized dependencies use the following:

```bash
npm install mongodb-stitch-react-native-core
npm install mongodb-stitch-react-native-services-aws
npm install mongodb-stitch-react-native-services-http
npm install mongodb-stitch-react-native-services-mongodb-remote
npm install mongodb-stitch-react-native-services-twilio
```

## Example Usage

### Creating a new app with the SDK (React Native)

#### Set up an application on Stitch
1. Go to [https://stitch.mongodb.com/](https://stitch.mongodb.com/) and log in to MongoDB Atlas.
2. Create a new app in your project with your desired name.
3. Go to your app in Stitch via Atlas by clicking Stitch Apps in the left side pane and clicking your app.
4. Copy your app's client app id by going to Clients on the left side pane and clicking copy on the App ID section.
5. Go to Providers from Users in the left side pane and edit and enable "Allow users to log in anonymously".

#### Set up a React Native project
1. Ensure that you have `npm` installed. See [npmjs.com](https://www.npmjs.com).
2. Follow the instructions in React Native's [Getting Started](https://facebook.github.io/react-native/docs/getting-started) guide to create a basic React Native project.
3. Once in the directory for your new project, add the MongoDB Stitch React Native SDK by running `npm install mongodb-stitch-react-native-sdk`.
4. Run `npm install` again to ensure that the SDK's dependencies are properly fetched.
5. In `App.js`, replace the existing code with the following, replacing `<your-client-app-id>` with the id you retrieved when setting up the application in MongoDB Stitch:

```jsx
import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native';
import { Stitch, AnonymousCredential } from 'mongodb-stitch-react-native-sdk';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      currentUserId: undefined,
      client: undefined
    };
    this._loadClient = this._loadClient.bind(this);
    this._onPressLogin = this._onPressLogin.bind(this);
    this._onPressLogout = this._onPressLogout.bind(this);
  }

  componentDidMount() {
    this._loadClient();
  }

  render() {
    let loginStatus = "Currently logged out."

    if(this.state.currentUserId) {
      loginStatus = `Currently logged in as ${this.state.currentUserId}!`
    }

    loginButton = <Button
                    onPress={this._onPressLogin}
                    title="Login"/>

    logoutButton = <Button
                    onPress={this._onPressLogout}
                    title="Logout"/>

    return (
      <View style={styles.container}>
        <Text> {loginStatus} </Text>
        {this.state.currentUserId !== undefined ? logoutButton : loginButton}
      </View>
    );
  }

  _loadClient() {
    Stitch.initializeDefaultAppClient('<your-client-app-id>').then(client => {
      this.setState({ client });

      if(client.auth.isLoggedIn) {
        this.setState({ currentUserId: client.auth.user.id })
      }
    });
  }

  _onPressLogin() {
    this.state.client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
        console.log(`Successfully logged in as user ${user.id}`);
        this.setState({ currentUserId: user.id })
    }).catch(err => {
        console.log(`Failed to log in anonymously: ${err}`);
        this.setState({ currentUserId: undefined })
    });
  }

  _onPressLogout() {
    this.state.client.auth.logout().then(user => {
        console.log(`Successfully logged out`);
        this.setState({ currentUserId: undefined })
    }).catch(err => {
        console.log(`Failed to log out: ${err}`);
        this.setState({ currentUserId: undefined })
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

```

6. Run the app by running `npm start` and following the instructions in the terminal.

### Using the SDK

#### Initialize the SDK
1. When your app has started, run the following code to initialize the Stitch SDK, replacing `<your-client-app-id>` with your Stitch application's client app ID:

```javascript
import { Stitch, AnonymousCredential } from 'mongodb-stitch-react-native-sdk';

Stitch.initializeDefaultAppClient('<your-client-app-id>').then(client => {
    // use the client
});
```

Please take note that unlike the other Stitch SDKs, this client initialization 
method is asynchronous. This is due to the fact that the client stores 
persisted authentication information using React Native's 
[AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html)
system.

2. To get an already-initialized client to use for logging in and communicating 
   with Stitch, use `Stitch.defaultAppClient`

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

In the case that you don't want a single default initialized `StitchAppClient`, 
you can use the following with as many client app IDs as you'd like to 
initialize clients for multiple app IDs:

```javascript
Stitch.initializeAppClient("<your-client-app-id>").then(client => {
    // use the client
});
```
You can use the client here or anywhere else in your app by using the following:

```javascript
const client = Stitch.getAppClient("<your-client-app-id>");
```

#### Closing the StitchAppClient

The client maintains some background processes in the event loop that must be 
shutdown when the client is no longer needed. Simply call `close` on the client 
when you are done with the client:

```javascript
client.close();
```
