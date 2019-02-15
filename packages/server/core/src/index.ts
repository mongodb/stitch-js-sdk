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

import {
  AnonymousAuthProvider,
  AnonymousCredential,
  BSON,
  Codec,
  CustomAuthProvider,
  CustomCredential,
  Decoder,
  Encoder,
  FacebookAuthProvider,
  FacebookCredential,
  GoogleAuthProvider,
  GoogleCredential,
  MemoryStorage,
  ServerApiKeyAuthProvider,
  ServerApiKeyCredential,
  StitchAppClientConfiguration,
  StitchAppClientInfo,
  StitchClientError,
  StitchClientErrorCode,
  StitchCredential,
  StitchRequestError,
  StitchRequestErrorCode,
  StitchServiceError,
  StitchServiceErrorCode,
  StitchUserIdentity,
  StitchUserProfile,
  Storage,
  Stream,
  StreamListener,
  Transport,
  UserApiKey,
  UserApiKeyAuthProvider,
  UserApiKeyCredential,
  UserPasswordAuthProvider,
  UserPasswordCredential,
  UserType
} from "mongodb-stitch-core-sdk";
import { UserApiKeyAuthProviderClient } from "./core/auth/providers/userapikey/UserApiKeyAuthProviderClient";
import { UserPasswordAuthProviderClient } from "./core/auth/providers/userpassword/UserPasswordAuthProviderClient";
import StitchAuth from "./core/auth/StitchAuth";
import StitchAuthListener from "./core/auth/StitchAuthListener";
import StitchUser from "./core/auth/StitchUser";
import Stitch from "./core/Stitch";
import StitchAppClient from "./core/StitchAppClient";
import NamedServiceClientFactory from "./services/internal/NamedServiceClientFactory";
import StitchServiceClient from "./services/StitchServiceClient";
import NodeFetchStreamTransport from "./core/internal/net/NodeFetchStreamTransport";

export {
  AnonymousAuthProvider,
  AnonymousCredential,
  BSON,
  Codec,
  CustomAuthProvider,
  CustomCredential,
  Decoder,
  Encoder,
  FacebookAuthProvider,
  FacebookCredential,
  GoogleAuthProvider,
  GoogleCredential,
  MemoryStorage,
  NamedServiceClientFactory,
  NodeFetchStreamTransport, 
  ServerApiKeyAuthProvider,
  ServerApiKeyCredential,
  Stitch,
  StitchAppClient,
  StitchAppClientConfiguration,
  StitchAppClientInfo,
  StitchAuth,
  StitchAuthListener,
  StitchClientError,
  StitchClientErrorCode,
  StitchCredential,
  StitchRequestError,
  StitchRequestErrorCode,
  StitchServiceClient,
  StitchServiceError,
  StitchServiceErrorCode,
  StitchUser,
  StitchUserIdentity,
  StitchUserProfile,
  Storage,
  Stream,
  StreamListener, 
  Transport,
  UserApiKey,
  UserApiKeyAuthProvider,
  UserApiKeyAuthProviderClient,
  UserApiKeyCredential,
  UserPasswordAuthProvider,
  UserPasswordAuthProviderClient,
  UserPasswordCredential,
  UserType,
};
