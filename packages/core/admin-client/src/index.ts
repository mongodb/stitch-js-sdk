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
} from "./resources/RulesResource";
import ServiceResource from "./resources/ServiceResource";
import { ServiceResponse, ServicesResource } from "./resources/ServicesResource";
import { ConfirmationEmail, UserRegistrationsResource } from "./resources/UserRegistrationsResource";
import UserResource from "./resources/UserResource";
import { UsersResource } from "./resources/UsersResource";
import StitchAdminClient from "./StitchAdminClient";
import { StitchAdminClientConfiguration } from "./StitchAdminClientConfiguration";

export {
  StitchAdminClientConfiguration,
  Anon,
  Userpass,
  AppsResource,
  AppCreator,
  AppResource,
  Custom,
  FunctionsResource,
  FunctionResource,
  FunctionCreator,
  ServicesResource,
  ServiceResource,
  ServiceConfig,
  ServiceResponse,
  StitchAdminClient,
  UserResource,
  UsersResource,
  UserRegistrationsResource,
  RuleResource,
  RuleCreator,
  RulesResource,
  AuthProviderResource,
  AuthProvidersResource,
  AppResponse,
  AuthProviderResponse,
  RuleResponse,
  ProviderConfig,
  ConfirmationEmail,
  Twilio,
  TwilioConfig,
  TwilioActions,
  TwilioRuleCreator,
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
