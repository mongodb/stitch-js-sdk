async function example({expect, Stitch, UserPasswordCredential}) {
  // In this example, a custom StitchAuthListener is defined and registered:
  const stitchClient = Stitch.defaultAppClient

  // Define the listener
  const myAuthListener = {
    onUserAdded: (auth, addedUser) => {
      console.log('onUserAdded:', addedUser.profile)
    },
    onUserLoggedIn: (auth, loggedInUser) => {
      console.log('onUserLoggedIn:', loggedInUser.profile)
    },
    onActiveUserChanged: (auth, currentActiveUser, previousActiveUser) => {
      console.log('onActiveUserChanged:', currentActiveUser, previousActiveUser)
    },
    onUserLoggedOut: (auth, loggedOutUser) => {
      console.log('onUserLoggedOut:', loggedOutUser.profile)
    },
    onUserRemoved: (auth, removedUser) => {
      console.log('onUserRemoved:', removedUser.profile)
    },
    onUserLinked: (auth, linkedUser) => {
      console.log('onUserLinked:', linkedUser.profile)
    },
    onListenerRegistered: (auth) => {
      console.log('onListenerRegistered')
    },
  }

  // Register the listener
  const {auth} = stitchClient
  auth.addAuthListener(myAuthListener)

  // Console:
  //   onListenerRegistered

  const user = await auth.loginWithCredential(new UserPasswordCredential('user', 'password'))

  // Console:
  //   onUserAdded
  //   onUserLoggedIn
  //   onActiveUserChanged

  await auth.logout()

  // Console:
  //   onUserLoggedOut
  //   onActiveUserChanged

  await auth.removeUserWithId(user.id)

  // Console:
  //   onUserRemoved
}
