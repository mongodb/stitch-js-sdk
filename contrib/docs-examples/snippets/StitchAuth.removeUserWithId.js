async function example({Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  // Log in with two users
  const user1 = await auth.loginWithCredential(new UserPasswordCredential('user1', 'password'))
  const user2 = await auth.loginWithCredential(new UserPasswordCredential('user2', 'password'))

  // List all logged in users
  console.log(auth.listUsers())

  // Now remove user1
  await auth.removeUserWithId(user1.id)

  // User has been removed from the list
  console.log(auth.listUsers())
}
