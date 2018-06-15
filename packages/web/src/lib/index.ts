import {
  AnonymousCredential,
  CustomCredential,
  FacebookCredential,
  GoogleCredential,
  MemoryStorage,
  ServerAPIKeyCredential,
  StitchAppClientConfiguration,
  UserAPIKeyCredential,
  UserPasswordCredential
} from "stitch-core";
import GoogleRedirectCredential from "./core/auth/providers/google/GoogleRedirectCredental";
import { UserAPIKeyAuthProviderClient } from "./core/auth/providers/userapikey/UserAPIKeyAuthProviderClient";
import { UserPasswordAuthProviderClient } from "./core/auth/providers/userpassword/UserPasswordAuthProviderClient";
import StitchAuth from "./core/auth/StitchAuth";
import StitchAuthListener from "./core/auth/StitchAuthListener";
import { StitchUser } from "./core/auth/StitchUser";
import Stitch from "./core/Stitch";
import StitchAppClient from "./core/StitchAppClient";
import NamedServiceClientFactory from "./services/internal/NamedServiceClientFactory";
import StitchServiceClient from "./services/internal/StitchServiceClient";


export {
  AnonymousCredential,
  GoogleRedirectCredential,
  CustomCredential,
  FacebookCredential,
  GoogleCredential,
  ServerAPIKeyCredential,
  UserAPIKeyCredential,
  UserPasswordCredential,
  MemoryStorage,
  NamedServiceClientFactory,
  Stitch,
  StitchAppClient,
  StitchAppClientConfiguration,
  StitchAuth,
  StitchAuthListener,
  StitchUser,
  StitchServiceClient,
  UserAPIKeyAuthProviderClient,
  UserPasswordAuthProviderClient
};
