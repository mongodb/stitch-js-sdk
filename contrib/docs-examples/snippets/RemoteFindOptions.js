function example({db}) {
  // Assumption: Stitch is already logged in

  // Work with the movies collection
  const moviesCollection = db.collection('movieDetails')

  const options = { // Match the shape of RemoteFindOptions.
    limit: 10,      // Return only first ten results.
    projection: {   // Return only the `title`, `releaseDate`, and
      title: 1,     //   (implicitly) the `_id` fields.
      releaseDate: 1,
    },
    sort: { // Sort by releaseDate descending (latest first).
      releaseDate: -1,
    },
  }

  moviesCollection
    .find({}, options) // Match any document with {} query. Pass the options as the second argument.
    .toArray()
    .then(movies => console.log('Ten latest movies:', movies))
    .catch(console.error)
}
