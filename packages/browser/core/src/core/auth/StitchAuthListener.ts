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

/**
 * StitchAuthListener is an interface for taking action whenever 
 * a particular [[StitchAppClient]]'s authentication state changes.
 *
 * Implement [[onAuthEvent]] to handle these events. You can register 
 * your listener with [[StitchAuth]] using [[StitchAuth.addAuthListener]].
 *
 * StitchAuth calls registered listeners when:
 * - a user logs in
 * - a user logs out
 * - a user is linked to another identity
 * - a listener is registered
 * - active user is switched
 *
 * ### Example
 *
 * In this example, a custom StitchAuthListener is defined and registered:
 * ```
 * const client = Stitch.defaultAppClient
 *
 * // Define the listener
 * class MyAuthListener {
 *   onAuthEvent = (auth) => {
 *     // The auth state has changed
 *     console.log('Current auth state changed: user =', auth.user)
 *   }
 * }
 *
 * // Register the listener
 * const {auth} = client
 * auth.addAuthListener(new MyAuthListener(auth))
 * ```
 * 
 * ### See also
 * - [[StitchAuth]]
 */
export default interface StitchAuthListener {
  /**
   * onAuthEvent is called any time a notable event regarding authentication happens. These events are:
   * * When a user logs in.
   * * When a user logs out.
   * * When a user is linked to another identity.
   * * When a listener is registered. This is to handle the case where during registration an event happens that the registerer would otherwise miss out on.
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
  onAuthEvent(auth: StitchAuth);
}
