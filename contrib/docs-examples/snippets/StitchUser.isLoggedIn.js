async function example({expect, Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  let user1 = await auth.loginWithCredential(new UserPasswordCredential('user1', 'password'))

  expect('user1 is logged in', user1.isLoggedIn)

  // Log out.
  await auth.logout()

  // The user1 object is a snapshot of the state at the time of assignment.
  // Its properties will not be updated despite the internal state having changed.
  expect('user1 is logged in??', user1.isLoggedIn)

  // To get the current state, call StitchAuth.listUsers().
  user1 = auth.listUsers().find(user => user.id === user1.id)

  expect('user1 is actually logged out', user1.isLoggedIn === false)
}
