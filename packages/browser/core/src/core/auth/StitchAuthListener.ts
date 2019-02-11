/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import StitchAuth from "./StitchAuth";
import StitchUser from "./StitchUser";

/**
 * StitchAuthListener is an interface for taking action whenever 
 * a particular [[StitchAppClient]]'s authentication state changes.
 *
 * Implement the methods in this interface to handle these events. You can 
 * register your listener with [[StitchAuth]] using 
 * [[StitchAuth.addAuthListener]].
 *
 * StitchAuth calls registered listeners when:
 * - a user is added to the device for the first time
 * - a user logs in
 * - a user logs out
 * - a user is linked to another identity
 * - a listener is registered
 * - the active user is changed
 * 
 * Some actions may trigger multiple events. For instance. Logging into a 
 * user for the first time will trigger [[onUserAdded]], [[onUserLoggedIn]],
 * and [[onActiveUserChanged]].
 * 
 * NOTE: The callbacks in this interface are called asynchronously. This means
 *       that if many auth events are happening at the same time, events that 
 *       come in may not necessarily reflect the current state of 
 *       authentication. Always check the state of [[StitchAuth]] object for 
 *       the true authentication state.
 *
 * @see
 * - [[StitchAuth]]
 */
export default interface StitchAuthListener {
  /**
   * @deprecated Use the other event methods for more detailed information
   *             about the auth event that has occured.
   * 
   * onAuthEvent is called any time the following events occur
   * * When a user logs in.
   * * When a user logs out.
   * * When a user is linked to another identity.
   * * When a listener is registered. This is to handle the case where during registration an event happens that the registerer would otherwise miss out on.
   * * When the active user has been switched.
   *
   * The [[StitchAuth]] instance itself is passed to this callback. This can be used to read the current state of authentication.
   *
   * ### Note
   * Specific event details are deliberately not provided here because the events could be stale by the time they are handled.
   * 
   * For example, a user could log in then log out before the first login event is handled.
   * 
   * The intention is that you would treat this callback as a trigger to refresh the relevant parts of your app based
   * on the new, current auth state.
   *
   * @param auth The instance of StitchAuth where the event happened. It should be used to infer the current state of authentication.
   */
  onAuthEvent?(auth: StitchAuth);

  /**
   * Called whenever a user is added to the device for the first time. If this 
   * is as part of a login, this method will be called before
   * [[onUserLoggedIn]], and [[onActiveUserChanged]] are called.
   * 
   * @param auth The instance of [[StitchAuth]] where the user was added. It can be used to infer the current state of authentication.
   * @param addedUser The user that was added to the device.
   */
  onUserAdded?(auth: StitchAuth, addedUser: StitchUser)

  /**
   * Called whenever a user is linked to a new identity.
   * 
   * @param auth The instance of [[StitchAuth]] where the user was linked. It can be used to infer the current state of authentication.
   * @param linkedUser The user that was linked to a new identity.
   */
  onUserLinked?(auth: StitchAuth, linkedUser: StitchUser)

  /**
   * Called whenever a user is logged in. This will be called before 
   * [[onActiveUserChanged]] is called.
   * 
   * Note: if an anonymous user was already logged in on the device, and you 
   * log in with an [[AnonymousCredential]], this method will not be called,
   * as the underlying [[StitchAuth]] will reuse the anonymous user's existing
   * session, and will thus only trigger [[onActiveUserChanged]].
   * 
   * @param auth The instance of [[StitchAuth]] where the user was logged in. It can be used to infer the current state of authentication.
   * @param loggedInUser The user that was logged in.
   */
  onUserLoggedIn?(auth: StitchAuth, loggedInUser: StitchUser)

  /**
   * Called whenever a user is logged out. The user logged out is not 
   * necessarily the active user. If the user logged out was the active user,
   * then [[onActiveUserChanged]] will be called after this method. If the user
   * was an anonymous user, that user will also be removed and 
   * [[onUserRemoved]] will also be called.
   * 
   * @param auth The instance of [[StitchAuth]] where the user was logged out. It can be used to infer the current state of authentication. 
   * @param loggedOutUser The user that was logged out.
   */
  onUserLoggedOut?(auth: StitchAuth, loggedOutUser: StitchUser)

  /**
   * Called whenever the active user changes. This may be due to a call to
   * [[StitchAuth.loginWithCredential]], [[StitchAuth.switchToUserWithId]],
   * [[StitchAuth.logout]], [[StitchAuth.logoutUserWithId]], 
   * [[StitchAuth.removeUser]], or [[StitchAuth.removeUserWithId]].
   * 
   * This may also occur on a normal request if a user's session is invalidated 
   * and they are forced to log out.
   * 
   * @param auth The instance of [[StitchAuth]] where the active user changed. It can be used to infer the current state of authentication. 
   * @param currentActiveUser The active user after the change.
   * @param previousActiveUser The active user before the change.
   */
  onActiveUserChanged?(
    auth: StitchAuth, 
    currentActiveUser: StitchUser | undefined, 
    previousActiveUser: StitchUser | undefined
  )

  /**
   * Called whenever a user is removed from the list of users on the device.
   * 
   * @param auth The instance of [[StitchAuth]] where the user was removed. It can be used to infer the current state of authentication. 
   * @param removedUser The user that was removed.
   */
  onUserRemoved?(auth: StitchAuth, removedUser: StitchUser)

  /**
   * Called whenever this listener is registered for the first time. This can 
   * be useful to infer the state of authentication, because any events that 
   * occured before the listener was registered will not be seen by the 
   * listener.
   * 
   * @param auth The instance of [[StitchAuth]] where the listener was registered. It can be used to infer the current state of authentication. 
   */
  onListenerRegistered?(auth: StitchAuth)
}
