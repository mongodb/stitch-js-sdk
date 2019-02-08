function example({Stitch, RemoteMongoClient}) {
  // Get the existing Stitch client.
  const stitchClient = Stitch.defaultAppClient

  // Get a client of the Remote Mongo Service for database access
  const mongoClient = stitchClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')

  // Retrieve a database object
  const db = mongoClient.db('video')

  // Retrieve the collection in the database
  const movieDetails = db.collection('movieDetails')

  // Find 10 documents and log them to console.
  movieDetails.find({}, {limit: 10})
    .toArray()
    .then(results => console.log('Results:', results))
}
