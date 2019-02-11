
// ^^^ Paste example() definition ^^^
// (Note: Examples are pasted automatically by the validate.sh script)

import {
  AnonymousCredential,
  RemoteMongoClient,
  Stitch,
} from 'mongodb-stitch-server-sdk'

process.on('unhandledRejection', (error) => {
  console.log(error)
  process.exit(1)
})

const stitchAppClient = Stitch.initializeDefaultAppClient('stitchapp-favtd')

stitchAppClient.auth.loginWithCredential(new AnonymousCredential())
  .then(() => {
    const mongoClient = stitchAppClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')
    const db = mongoClient.db('video')
    example({
      AnonymousCredential,
      db,
      mongoClient,
      Stitch,
      RemoteMongoClient,
      stitchAppClient,
    })
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

stitchAppClient.close()
