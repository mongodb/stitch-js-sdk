import StitchAuth from "./StitchAuth";

interface StitchAuthListener {
  /**
   * onAuthEvent is called any time a notable event regarding authentication happens. These events are:
   * * When a user logs in.
   * * When a user logs out.
   * * When a user is linked to another identity.
   * * When a listener is registered. This is to handle the case where during registration an event happens that the registerer would otherwise miss out on.
   *
   * @param auth The instance of StitchAuth where the event happened. It should be used to infer the current state of authentication.
   */
  onAuthEvent(auth: StitchAuth);
}

export default StitchAuthListener;
