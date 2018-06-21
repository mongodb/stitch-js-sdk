[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# MongoDB Stitch Web SDK 

The official [MongoDB Stitch](https://stitch.mongodb.com/) SDK for JavaScript/TypeScript.

### Index
- [Documentation](#documentation)
- [Discussion](#discussion)
- [Installation](#installation)
- [Example Usage](#example-usage)

## Documentation
* [API/Javadoc Documentation](https://s3.amazonaws.com/stitch-sdks/android/docs/4.0.0/index.html)
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

## Example Usage

### Creating a new app with the SDK (Web)

#### Set up an application on Stitch
1. Go to [https://stitch.mongodb.com/](https://stitch.mongodb.com/) and log in to MongoDB Atlas.
2. Create a new app in your project with your desired name.
3. Go to your app in Stitch via Atlas by clicking Stitch Apps in the left side pane and clicking your app.
3. Copy your app's client app id by going to Clients on the left side pane and clicking copy on the App ID section.
4. Go to Providers from Users in the left side pane and edit and enable "Allow users to log in anonymously".

<!--TODO make this a barebones webpack example #### Set up a project in Android Studio using Stitch
1. Download and install [Android Studio](https://developer.android.com/studio/index.html).
2. Start a new Android Studio project.
	* Note: The minimum supported API level is 21 (Android 5.0 Lollipop)
	* Starting with an empty activity is ideal
3. In your build.gradle for your app module, add the following to your dependencies block:

	```gradle
    implementation 'org.mongodb:stitch-android-sdk:4.0.0'
    ```
4. Android Studio will prompt you to sync your changes in your project; hit Sync Now.

#### Set up an Android Virtual Device

1. In Android Studio, go to Tools, Android, AVD manager.
2. Click Create Virtual Device.
3. Select a device that should run your app (the default is fine).
4. Select and download a recommended system image of your choice (the latest is fine).
	* x86_64 images are available in the x86 tab.
5. Name your device and hit finish.

#### Using the SDK

##### Set up app info
1. Create a resource values file in your app (e.g. res/values/mongodb-stitch.xml) and set the following using the app id you copied earlier in place of YOUR_APP_ID:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="stitch_client_app_id">YOUR_APP_ID</string>
</resources>
```

##### Logging In
1. Since we enabled anonymous log in, let's log in with it; add the following anywhere in your code:

	```java
	final StitchAppClient client = Stitch.getDefaultAppClient();
    client.getAuth().loginWithCredential(new AnonymousCredential()).addOnCompleteListener(
        new OnCompleteListener<StitchUser>() {
      @Override
      public void onComplete(@NonNull final Task<StitchUser> task) {
        if (task.isSuccessful()) {
          Log.d("myApp", String.format(
              "logged in as user %s with provider %s",
              task.getResult().getId(),
              task.getResult().getLoggedInProviderType()));
        } else {
          Log.e("myApp", "failed to log in", task.getException());
        }
      }
    });
	```

2. Now run your app in Android Studio by going to run, Run 'app'. Use the Android Virtual Device you created previously
3. Once the app is running, open up Logcat in the bottom of Android studio and you should see the following log message:

	```
	logged in as user 5b0483778f25b978044aca76 with provider anon-user
	```
	
##### Getting a StitchAppClient without Stitch.getDefaultAppClient

In the case that you don't want a default initialized StitchAppClient by setting up the resource values, you can use the following code once to initialize a client for a given app id that you copied earlier:

```java
final StitchAppClient client = Stitch.initializeAppClient("YOUR_APP_ID");
```

You can use the client returned there or anywhere else in your app you can use the following:

```java
final StitchAppClient client = Stitch.getAppClient("YOUR_APP_ID");
``` -->

<!-- # mongodb-stitch-browser-sdk

[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[MongoDB Stitch Users - Google Group](https://groups.google.com/d/forum/mongodb-stitch-users)

[MongoDB Stitch Announcements - Google Group](https://groups.google.com/d/forum/mongodb-stitch-announce)

The original source is located in `src/`.
To transpile to pure JS, run `npm run build` which places the output into `dist/`.

### [Documentation](https://s3.amazonaws.com/stitch-sdks/js/docs/master/index.html)

### Usage

#### Construct a simple app-wide client

```
import { StitchClientFactory } from 'mongodb-stitch';
let appId = 'sample-app-ovmyj';
let stitchClientPromise = StitchClientFactory.create(appId);
```

The `StitchClient` only needs to be resolved once from `StitchClientFactory.create()` and it can be used for the lifetime of an application.

#### Authenticate anonymously

```
stitchClientPromise.then(stitchClient => stitchClient.login())
  .then(() => console.log('logged in as: ' + stitchClient.authedId()))
  .catch(e => console.log('error: ', e));
```

#### Access MongoDB APIs

```
stitchClientPromise.then(stitchClient => {
  let db = stitchClient.service('mongodb', 'mongodb1').db('app-ovmyj'); // mdb1 is the name of the mongodb service registered with the app.
  let itemsCollection = db.collection('items');

  // CRUD operations:
  const userId = stitchClient.authedId();
  return itemsCollection.insertMany(
    [ 
      { owner_id: userId, x: 'item1' }, 
      { owner_id: userId, x: 'item2' }, 
      { owner_id: userId, x: 'item3' } 
    ]
  );
}).then(result => console.log('success: ', result))
  .catch(e => console.log('error: ', e));
```

#### Execute a function

```
stitchClientPromise.then(stitchClient => 
  stitchClient.executeFunction('myFunc', 1, 'arg2', {arg3: true})
).then(result => console.log('success: ', result))
  .catch(e => console.log('error: ', e));
```


#### Execute a service function

```
stitchClientPromise.then(stitchClient =>
  stitchClient.executeServiceFunction('http1', 'get', {url: 'https://domain.org'})
).then(result => console.log('success: ', result))
  .catch(e => console.log('error: ', e));
``` -->

