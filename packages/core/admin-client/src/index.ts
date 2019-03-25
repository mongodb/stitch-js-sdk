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

import AdminFetchTransport from "./AdminFetchTransport";
import { App, AppResource, AppsResource } from "./apps/AppsResources";
import { AuthProviderResource } from "./authProviders/AuthProvidersResources";
import {
  AnonProviderConfig,
  UserpassProviderConfig
} from "./authProviders/ProviderConfigs";
import {
  AwsS3Actions,
  AwsSesActions,
  HttpActions,
  TwilioActions
} from "./services/rules/RulesResources";
import {
  AwsConfig,
  AwsS3,
  AwsS3Config,
  AwsSes,
  AwsSesConfig,
  Mongo,
  Twilio,
  TwilioConfig
} from "./services/ServiceConfigs";
import StitchAdminClient from "./StitchAdminClient";
import { ConfirmationEmail } from "./userRegistrations/UserRegistrationsResources";

export {
  AdminFetchTransport,
  AnonProviderConfig as Anon,
  App,
  AppsResource,
  AppResource,
  AwsConfig,
  AwsS3,
  AwsS3Actions,
  AwsS3Config,
  AwsSes,
  AwsSesActions,
  AwsSesConfig,
  ConfirmationEmail,
  HttpActions,
  Mongo,
  StitchAdminClient,
  Twilio,
  TwilioActions,
  TwilioConfig,
  UserpassProviderConfig as Userpass,
};
