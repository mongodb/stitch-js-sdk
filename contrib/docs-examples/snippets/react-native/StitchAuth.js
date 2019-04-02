function example({AnonymousCredential, UserPasswordCredential, stitchAppClient}) {
  // Previously:
  // const stitchAppClient = await Stitch.initializeDefaultAppClient('your-stitch-app-id')

  // Log in with anonymous credential
  stitchAppClient.auth
    .loginWithCredential(new AnonymousCredential())
    .then((user) => {
      console.log(`Logged in as anonymous user with id: ${user.id}`)
    })
    .catch(console.error)

  // Log in with user/password credential
  stitchAppClient.auth
    .loginWithCredential(new UserPasswordCredential('user', 'password'))
    .then((user) => {
      console.log(`Logged in as user with id: ${user.id}`)
    })
    .catch(console.error)
}
