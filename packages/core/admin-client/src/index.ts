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
import { AppResponse } from "./apps/AppsResources";
import { AuthProviderResponse } from "./authProviders/AuthProvidersResources";
import {
  Anon,
  Custom,
  ProviderConfig,
  Userpass
} from "./configs/AuthProviderConfigs";
import {
  AwsS3,
  AwsS3Config,
  AwsSes,
  AwsSesConfig,
  Http,
  Mongo,
  ServiceConfig,
  Twilio,
  TwilioConfig
} from "./configs/ServiceConfigs";
import AppResource from "./resources/AppResource";
import { AppCreator, AppResponse, AppsResource } from "./resources/AppsResource";
import AuthProviderResource from "./resources/AuthProviderResource";
import { AuthProviderResponse, AuthProvidersResource } from "./resources/AuthProvidersResource";
import FunctionResource from "./resources/FunctionResource";
import { FunctionCreator, FunctionsResource } from "./resources/FunctionsResource";
import RuleResource from "./resources/RuleResource";
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
  RulesResource,
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
import { StitchAdminClientConfiguration } from "./StitchAdminClientConfiguration";

export {
  AdminFetchTransport,
  Anon,
  App,
  AppResponse,
  Apps,
  AuthProvider,
  AuthProviderResponse,
  AuthProviders,
  Aws,
  AwsConfig,
  AwsRuleCreator,
  AwsS3,
  AwsS3Actions,
  AwsS3Config,
  AwsS3RuleCreator,
  AwsSes,
  AwsSesActions,
  AwsSesConfig,
  AwsSesRuleCreator,
  ConfirmationEmail,
  Custom,
  Function,
  FunctionCreator,
  Functions,
  Http,
  HttpActions,
  HttpRuleCreator,
  Mongo,
  MongoDbRuleCreator,
  ProviderConfig,
  Rule,
  RuleCreator,
  RuleResponse,
  Rules,
  Service,
  ServiceConfig,
  ServiceResponse,
  Services,
  StitchAdminClient,
  Twilio,
  TwilioActions,
  TwilioConfig,
  TwilioRuleCreator,
  User,
  UserRegistrations,
  Userpass,
  Users,
};
