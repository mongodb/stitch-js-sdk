/**
 *
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
  CustomFunctionProvider,
  CustomFunctionProviderConfig,
  Provider,
  UserpassProvider, 
  UserpassProviderConfig
} from "./authProviders/ProviderConfigs";
import { FunctionResource, FunctionsResource, StitchFunction } from "./functions/FunctionsResources";
import {
  AdditionalFields,
  AwsRule,
  AwsS3Action,
  AwsS3Rule,
  AwsSesAction,
  AwsSesRule,
  HttpAction,
  HttpRule,
  MongoDbRule,
  Role,
  Rule,
  RuleResource,
  RulesResource,
  Schema,
  TwilioAction,
  TwilioRule
} from "./services/rules/RulesResources";
import {
  AwsConfig,
  AwsS3Config,
  AwsS3Service,
  AwsService,
  AwsSesConfig,
  AwsSesService,
  HttpService,
  MongoConfig,
  MongoDbService,
  Service,
  TwilioConfig,
  TwilioService
} from "./services/ServiceConfigs";
import { ServiceResource, ServicesResource } from "./services/ServicesResources";
import StitchAdminClient from "./StitchAdminClient";
import { ConfirmationEmail, UserRegistrationsResource } from "./userRegistrations/UserRegistrationsResources";
import {
  User,
  UserCreator, 
  UserResource,
  UsersResource
} from "./users/UsersResources";

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
  AwsRule,
  AwsService,
  AwsS3Action,
  AwsS3Rule,
  AwsS3Service,
  AwsS3Config,
  AwsSesService,
  AwsSesAction,
  AwsSesConfig,
  AwsSesRule,
  HttpRule,
  ConfirmationEmail,
  HttpAction,
  MongoConfig,
  MongoDbService,
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
  CustomFunctionProvider,
  CustomFunctionProviderConfig,
  Rule,
  RuleResource,
  RulesResource,
  User,
  UserCreator, 
  UserResource,
  UsersResource,
  StitchFunction,
  FunctionResource,
  FunctionsResource,
  TwilioRule,
  TwilioService,
  HttpService,
  MongoDbRule,
  Role,
  Schema,
  AdditionalFields
};
