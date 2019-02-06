function example({db}) {
  async function handleMovie(cursor) {
    const movie = await cursor.next()
    if (movie === undefined) {
      return
    }
    console.log(movie)
    // ... process and decide whether to keep iterating ...
    handleMovie(cursor)
  }

  // Work with the movies collection
  const moviesCollection = db.collection('movieDetails')

  moviesCollection
    .find({}, {limit: 10})
    .iterator()
    .then(handleMovie)
}
