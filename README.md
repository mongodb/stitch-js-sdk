# mongodb-stitch

[![Join the chat at https://gitter.im/mongodb/stitch](https://badges.gitter.im/mongodb/stitch.svg)](https://gitter.im/mongodb/stitch?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The original source is located in `src/`.
To transpile to pure JS, run `npm run build` which places the output into `dist/`.

### [Documentation](https://mongodb.github.io/stitch-js-sdk/)

### Usage

Construct a simple app-wide client:
```
import { StitchClient } from 'stitch';
let appId = 'sample-app-ovmyj';
let stitchClient = new StitchClient(appId);
```

Authenticate anonymously:
```
stitchClient.anonymousAuth()
  .then(() => console.log('logged in as: ' + stitchClient.authedId()))
  .catch(e => console.log('error: ', e));
```

Access MongoDB APIs:
```
let db = stitchClient.service('mongodb', 'mongodb1').db('app-ovmyj'); // mdb1 is the name of the mongodb service registered with the app.
let itemsCollection = db.collection('items');

// CRUD operations:
let userId = stitchClient.authedId();
itemsCollection.insertMany([ { owner_id: userId, x: 'item1' }, { owner_id: userId, x: 'item2' }, { owner_id: userId, x: 'item3' } ])
  .then(result => console.log('success: ', result))
  .catch(e => console.log('error: ', e));
```

Access other services:
```
// executePipeline takes an array of pipeline stages.
stitchClient.executePipeline([
  {
    action: 'literal',
    args: {
      items: [ { name: 'hi' }, { name: 'hello' }, { name: 'goodbye' } ]
    }
  },
  {
    action: 'match',
    args: {
      expression: { name: 'hello' }
    }
  }
])
  .then(result => console.log('success: ', result))
  .catch(e => console.log('error: ', e));;
```
