async function example({expect, Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  // Log in
  const user = await auth.loginWithCredential(new UserPasswordCredential('user', 'password'))

  expect('Users list now contains user',
    undefined !== auth.listUsers().find(entry => entry.id === user.id))

  // Now remove active user
  await auth.removeUser()

  expect('User has been removed from list',
    undefined === auth.listUsers().find(entry => entry.id === user.id))
}
