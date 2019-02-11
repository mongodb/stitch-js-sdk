function example({Stitch}) {
  // In this example, a custom StitchAuthListener is defined and registered:
  const stitchClient = Stitch.defaultAppClient

  // Define the listener
  const myAuthListener = {
    onAuthEvent: (auth) => {
      // The auth state has changed
      console.log('Current auth state changed: user =', auth.user)
    },
  }

  // Register the listener
  const {auth} = stitchClient
  auth.addAuthListener(myAuthListener)
}
