function example({Stitch, AnonymousCredential, stitchAppClient}) {
  // Previously:
  // const stitchAppClient = Stitch.initializeDefaultAppClient('your-stitch-app-id')

  // Log in with anonymous credential
  stitchAppClient.auth
    .loginWithCredential(new AnonymousCredential())
    .then((user) => {
      console.log(`Logged in as anonymous user with id: ${user.id}`)
    })
    .catch(console.error)
}
