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
import { AuthProviderResource, AuthProvidersResource } from "./authProviders/AuthProvidersResources";
import {
  AnonProviderConfig, 
  ApiKey,
  CustomProvider, 
  CustomProviderConfig, 
  Provider, 
  UserpassProvider, 
  UserpassProviderConfig
} from "./authProviders/ProviderConfigs";
import {
  AwsS3Action,
  AwsSesAction,
  HttpAction,
  Rule,
  RuleResource,
  RulesResource,
  TwilioAction
} from "./services/rules/RulesResources";
import {
  AwsConfig,
  AwsS3Config,
  AwsS3Service,
  AwsSesConfig,
  AwsSesService,
  MongoDbService,
  Service,
  TwilioConfig,
  TwilioService
} from "./services/ServiceConfigs";
import {ServiceResource, ServicesResource} from "./services/ServicesResources";
import StitchAdminClient from "./StitchAdminClient";

import { ConfirmationEmail, UserRegistrationsResource } from "./userRegistrations/UserRegistrationsResources";

export {
  AuthProviderResource,
  AuthProvidersResource,
  AdminFetchTransport,
  Service,
  AnonProviderConfig as Anon,
  App,
  AppsResource,
  AppResource,
  AwsConfig,
  AwsS3Service as AwsS3,
  AwsS3Action,
  AwsS3Config,
  AwsSesService as AwsSes,
  AwsSesAction,
  AwsSesConfig,
  ConfirmationEmail,
  HttpAction,
  MongoDbService as Mongo,
  StitchAdminClient,
  TwilioService as Twilio,
  TwilioAction,
  TwilioConfig,
  UserpassProviderConfig as Userpass,
  Provider, 
  AnonProviderConfig, 
  ApiKey, 
  UserRegistrationsResource,
  UserpassProviderConfig, 
  UserpassProvider, 
  ServiceResource,
  ServicesResource,
  CustomProviderConfig, 
  CustomProvider,
  Rule,
  RuleResource,
  RulesResource,
};
