# BaaS JS Client

The original source is located in `src/`.
To transpile to pure JS, run `npm run build` which places the output into `dist/`.

### TODO

* Handle auth expiring (observer pattern?)
* Handle User/app domain mismatch (same as auth expiry?)

### Usage

Construct a simple app-wide client:
```
import { BaasClient } from 'baas';
let baasHostName = 'localhost:8080';
let appName = 'sample-app';
let baasClient = new BaasClient(`http://${baasHostName}/v1/app/${appName}`);
```

Access MongoDB APIs:
```
let db = baasClient.service('mongodb', 'mdb1').db('dbName'); // mdb1 is the name of the mongodb service registered with the app.
let testCollection = db.collection('test');

// CRUD operations:
testCollection.insertMany([ { x: 'item1' }, { x: 'item2' }, { x: 'item3' } ])
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
      items: [ { name: 'hi' } ]
    }
  },
  {
    service: 'tw1',
    action: 'send',
    args: {
      to: '+1' + this._number.value,
      from: '$$values.ourNumber',
      body: 'Your confirmation code is ' + code
    }
  }
]);
```
