async function example({expect, Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  // Log in with user/password credential. The Email/Password Provider
  // was enabled in the Stitch UI Users Panel.
  let user = await auth.loginWithCredential(new UserPasswordCredential('user', 'password'))

  expect('User is logged in', user.isLoggedIn)

  // Log out the user who just logged in.
  await auth.logoutUserWithId(user.id)

  // Update the user with the latest state
  user = auth.listUsers().find(entry => entry.id === user.id)

  expect('User is logged out', !user.isLoggedIn)
}
