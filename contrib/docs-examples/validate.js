
// ^^^ Paste example() definition ^^^
// (Note: Examples are pasted automatically by the validate.sh script)

import {
  AnonymousCredential,
  BSON,
  RemoteMongoClient,
  MemoryStorage,
  Stitch,
  StitchAppClientConfiguration,
  UserPasswordCredential,
} from '../../packages/server/sdk/dist/cjs'

process.on('unhandledRejection', (error) => {
  console.log(error)
  process.exit(1)
})

function expect(message, expression) {
  if (!expression) {
    throw new Error(`Expectation failed: ${message} -- got ${expression}`)
  }
}

const configuration = (new StitchAppClientConfiguration.Builder()).build()
configuration.storage = new MemoryStorage()
const stitchAppClient = Stitch.initializeDefaultAppClient('stitchapp-favtd', configuration)

stitchAppClient.auth.loginWithCredential(new AnonymousCredential())
  .then((user) => {
    const mongoClient = stitchAppClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')
    const db = mongoClient.db('video')
    example({
      AnonymousCredential,
      BSON,
      db,
      expect,
      mongoClient,
      RemoteMongoClient,
      Stitch,
      stitchAppClient,
      user,
      UserPasswordCredential,
    })
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

stitchAppClient.auth.close()
