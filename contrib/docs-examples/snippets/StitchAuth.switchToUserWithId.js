async function example({expect, Stitch, UserPasswordCredential}) {
  const stitchAppClient = Stitch.defaultAppClient

  const {auth} = stitchAppClient

  // Log in as user1
  await auth.loginWithCredential(new UserPasswordCredential('user1', 'password'))

  // Active user is now user1
  const user1 = auth.user

  // Log in as user2
  await auth.loginWithCredential(new UserPasswordCredential('user2', 'password'))

  // Active user is now user2
  const user2 = auth.user

  // See that auth.user has changed upon loginWithCredential()
  expect('user1 is not user2', user1.id !== user2.id)

  let activeUser = auth.user

  // Verify that active user is user2
  expect('active user is user2', activeUser.id === user2.id)

  // Switch active user to to user1
  activeUser = auth.switchToUserWithId(user1.id)

  // Verify that active user is now user1
  expect('active user is user1', activeUser.id === user1.id)
}
