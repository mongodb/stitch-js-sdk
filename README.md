# mongodb-stitch

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
```

