function example({AnonymousCredential, Stitch, RemoteMongoClient}) {
  const stitchAppClient = Stitch.defaultAppClient

  // Get the RemoteMongoClient via the service client interface
  const mongoClient = stitchAppClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')

  // Log in to access the database. Anonymous Authentication is enabled from the Stitch UI.
  stitchAppClient.auth
    .loginWithCredential(new AnonymousCredential())
    .then(() => {
      // Retrieve a database object
      const db = mongoClient.db('video')

      // Retrieve the collection in the database
      const movieDetails = db.collection('movieDetails')

      // Find 10 documents and log them to console.
      movieDetails.find({}, {limit: 10})
        .toArray()
        .then(results => console.log('Results:', results))
        .catch(console.error)
    })
    .catch(console.error)
}
