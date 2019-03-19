async function example({Stitch, RemoteMongoClient, user}) {
  // Assumption: Stitch is already logged in and the app allows this
  // user to read/write data to a 'comments' collection.

  // Get the existing Stitch client.
  const stitchClient = Stitch.defaultAppClient

  // Get a client of the Remote Mongo Service for database access
  const mongoClient = stitchClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')

  // Retrieve a database object
  const db = mongoClient.db('sandbox')

  // Retrieve the collection in the database
  const comments = db.collection('comments')

  // Insert a document and get its id.
  const _id = (await comments.insertOne({
    owner_id: user.id,
    text: 'Hello!',
  })).insertedId

  // Watch the document that was just created.
  const changeStream = await comments.watch([
    _id,
  ])

  // Set the change listener. This will be called
  // when the watched documents are updated.
  changeStream.onNext((event) => {
    console.log('Watched document changed:', event)

    // Be sure to close the stream when finished.
    changeStream.close()
  })

  // Update the watched document.
  await comments.updateOne({
    _id,
  }, {
    $set: {text: 'Goodbye!'},
  })
}
