async function example({Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  // Log in as two different users.
  await auth.loginWithCredential(new UserPasswordCredential('user1', 'password'))
  await auth.loginWithCredential(new UserPasswordCredential('user2', 'password'))

  // List users.
  console.log(auth.listUsers())
}
