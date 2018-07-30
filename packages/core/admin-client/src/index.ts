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

import { AppResponse } from "./apps/AppsResources";
import { AuthProviderResponse } from "./authProviders/AuthProvidersResources";
import {
  Anon,
  Custom,
  ProviderConfig,
  Userpass
} from "./authProviders/ProviderConfigs";
import { FunctionCreator } from "./functions/FunctionsResources";
import {
  App,
  Apps,
  AuthProvider,
  AuthProviders,
  Function,
  Functions,
  Rule,
  Rules,
  Service,
  Services,
  User,
  UserRegistrations,
  Users
} from "./Resources";
import {
  AwsRuleCreator,
  AwsS3Actions,
  AwsS3RuleCreator,
  AwsSesActions,
  AwsSesRuleCreator,
  HttpActions,
  HttpRuleCreator,
  MongoDbRuleCreator,
  RuleCreator,
  RuleResponse,
  TwilioActions,
  TwilioRuleCreator
} from "./services/rules/RulesResources";
import {
  Aws,
  AwsConfig,
  AwsS3,
  AwsS3Config,
  AwsSes,
  AwsSesConfig,
  Http,
  Mongo,
  ServiceConfig,
  Twilio,
  TwilioConfig
} from "./services/ServiceConfigs";
import { ServiceResponse } from "./services/ServicesResources";
import StitchAdminClient from "./StitchAdminClient";
import { ConfirmationEmail } from "./userRegistrations/UserRegistrationsResources";

export {
  Anon,
  Userpass,
  Apps,
  App,
  Custom,
  Functions,
  Function,
  FunctionCreator,
  Services,
  Service,
  ServiceConfig,
  ServiceResponse,
  StitchAdminClient,
  User,
  Users,
  UserRegistrations,
  Rule,
  RuleCreator,
  Rules,
  AuthProvider,
  AuthProviders,
  AppResponse,
  AuthProviderResponse,
  RuleResponse,
  ProviderConfig,
  ConfirmationEmail,
  Twilio,
  TwilioConfig,
  TwilioActions,
  TwilioRuleCreator,
  Aws,
  AwsConfig,
  AwsRuleCreator,
  AwsSes,
  AwsSesConfig,
  AwsSesActions,
  AwsSesRuleCreator,
  AwsS3,
  AwsS3Config,
  AwsS3Actions,
  AwsS3RuleCreator,
  Http,
  HttpActions,
  HttpRuleCreator,
  Mongo,
  MongoDbRuleCreator
};
