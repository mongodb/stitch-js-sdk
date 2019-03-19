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

/**
 * StitchRedirectCredential is an interface for [OAuth2](https://en.wikipedia.org/wiki/OAuth)
 * login flow credentials.
 * 
 * Pass implementations to [[StitchAuth.loginWithRedirect]] to log in as a [[StitchUser]].
 * 
 * Each [Authentication Provider](https://docs.mongodb.com/stitch/authentication/)
 * in MongoDB Stitch provides a [[StitchCredential]] or StitchRedirectCredential
 * implementation. See **Implemented by** below for a list of implementations.
 *
 * @see
 * - [[StitchAuth]]
 * - [[StitchAuth.loginWithRedirect]] 
 * - [[StitchCredential]]
 */
export default interface StitchRedirectCredential {
  readonly providerName: string;
  readonly providerType: string;
  readonly redirectUrl?: string;
}
