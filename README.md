# BaaS JS Client

The original source is located in `src/`.
To transpile to pure JS, run `npm run build` which places the output into `dist/`.

### Usage

Construct a simple app-wide client:
```
import { BaasClient } from 'baas';
let appId = 'sample-app-ovmyj';
let baasClient = new BaasClient(appId);
```

Authenticate anonymously:
```
baasClient.anonymousAuth()
  .then(() => console.log('logged in as: ' + baasClient.auth().user._id))
  .catch(e => console.log('error: ', e));
```

Access MongoDB APIs:
```
let db = baasClient.service('mongodb', 'mongodb1').db('app-ovmyj'); // mdb1 is the name of the mongodb service registered with the app.
let itemsCollection = db.collection('items');

// CRUD operations:
let userId = baasClient.authedId();
itemsCollection.insertMany([ { owner_id: userId, x: 'item1' }, { owner_id: userId, x: 'item2' }, { owner_id: userId, x: 'item3' } ])
  .then(result => console.log('success: ', result))
  .catch(e => console.log('error: ', e));
```

Access other services:
```
// executePipeline takes an array of pipeline stages.
baasClient.executePipeline([
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
