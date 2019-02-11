async function example({expect, Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  const user1 = await auth.loginWithCredential(new UserPasswordCredential('user1', 'password'))
  const user2 = await auth.loginWithCredential(new UserPasswordCredential('user2', 'password'))

  // Active user is now user2
  expect('Active user to be user2', auth.user.id === user2.id)

  await auth.logout()

  // The active user is now undefined. Stitch does not assume it should
  // switch to another active account upon logout
  expect('Active user to be undefined', auth.user === undefined)

  // Explicitly switch to a desired active user
  auth.switchToUserWithId(user1.id)

  expect('Active user to be user1', auth.user.id === user1.id)
}
