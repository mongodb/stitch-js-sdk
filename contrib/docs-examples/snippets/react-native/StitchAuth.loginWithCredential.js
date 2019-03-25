function example() {} function untested({View, Text, Button, React, GoogleSignin, Stitch, GoogleCredential, GoogleSigninButton}) { // too much boilerplate to be able to test this
  // Example component that uses the react-native-google-signin module to get
  // the server auth code for Stitch to use.
  //
  // NOTE: The react-native-google-signin native module must be installed correctly
  // and your Google project must be configured.
  //
  // For more detail, see https://stackoverflow.com/questions/55145071/#55173164
  //
  // Above:
  // import {Stitch, GoogleCredential} from 'mongodb-stitch-react-native-sdk'
  // import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin'
  class GoogleLogin extends React.Component {
    // ...

    componentDidMount() {
      // Configure react-native-google-signin
      GoogleSignin.configure({
        webClientId: '<id>', // client ID of type WEB from Stitch
        offlineAccess: true, // allows Stitch service to use credential
        iosClientId: '<id>', // [iOS] CLIENT_ID from GoogleService-Info.plist
      })
    }

    _onPressLogin = async () => {
      // It's recommended to call this before signIn()
      await GoogleSignin.hasPlayServices()

      // Sign in via react-native-google-signin
      const userInfo = await GoogleSignin.signIn()

      // Retrieve the server auth code
      const {serverAuthCode} = userInfo
      if (serverAuthCode === null) {
        throw new Error('Failed to get serverAuthCode!')
      }
      try {
        // Pass auth code to Stitch with a GoogleCredential
        const {auth} = Stitch.defaultAppClient
        const user = await auth.loginWithCredential(new GoogleCredential(serverAuthCode))

        // Log in was successful
        console.log(`Successfully logged in as user ${user.id}`)
        this.setState({currentUserId: user.id})
      } catch (err) {
        // Login failed
        console.error(`Failed to log in: ${err}`)
        this.setState({currentUserId: undefined})
      }
    }

    _onPressLogout = async () => {
      // Logout react-native-google-signin
      await GoogleSignin.revokeAccess()
      await GoogleSignin.signOut()

      // Then log Stitch out
      const {auth} = Stitch.defaultAppClient
      const user = await auth.logout()

      console.log(`Successfully logged out user ${user.id}`)
      this.setState({currentUserId: undefined})
    }

    render() {
      let loginStatus = 'Currently logged out.'
      const {currentUserId, isSigninInProgress} = this.state
      if (currentUserId) {
        loginStatus = `Currently logged in as ${currentUserId}.`
      }

      // Leverage react-native-google-signin's GoogleSigninButton
      const loginButton = (
        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this._onPressLogin}
          disabled={isSigninInProgress}
        />
      )

      const logoutButton = (
        <Button
          onPress={this._onPressLogout}
          title="Logout"
        />
      )

      return (
        <View>
          <Text> {loginStatus} </Text>
          {currentUserId === undefined ? loginButton : logoutButton}
        </View>
      )
    }
  }
}
