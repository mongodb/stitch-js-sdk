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


/** StitchServiceErrorCode represents the set of errors that can come back from a Stitch request. */
export enum StitchServiceErrorCode {
  MissingAuthReq = "MissingAuthReq",
  InvalidSession = "InvalidSession", // Invalid session, expired, no associated user, or app domain mismatch,
  UserAppDomainMismatch = "UserAppDomainMismatch",
  DomainNotAllowed = "DomainNotAllowed",
  ReadSizeLimitExceeded = "ReadSizeLimitExceeded",
  InvalidParameter = "InvalidParameter",
  MissingParameter = "MissingParameter",
  TwilioError = "TwilioError",
  GCMError = "GCMError",
  HTTPError = "HTTPError",
  AWSError = "AWSError",
  MongoDBError = "MongoDBError",
  ArgumentsNotAllowed = "ArgumentsNotAllowed",
  FunctionExecutionError = "FunctionExecutionError",
  NoMatchingRuleFound = "NoMatchingRuleFound",
  InternalServerError = "InternalServerError",
  AuthProviderNotFound = "AuthProviderNotFound",
  AuthProviderAlreadyExists = "AuthProviderAlreadyExists",
  ServiceNotFound = "ServiceNotFound",
  ServiceTypeNotFound = "ServiceTypeNotFound",
  ServiceAlreadyExists = "ServiceAlreadyExists",
  ServiceCommandNotFound = "ServiceCommandNotFound",
  ValueNotFound = "ValueNotFound",
  ValueAlreadyExists = "ValueAlreadyExists",
  ValueDuplicateName = "ValueDuplicateName",
  FunctionNotFound = "FunctionNotFound",
  FunctionAlreadyExists = "FunctionAlreadyExists",
  FunctionDuplicateName = "FunctionDuplicateName",
  FunctionSyntaxError = "FunctionSyntaxError",
  FunctionInvalid = "FunctionInvalid",
  IncomingWebhookNotFound = "IncomingWebhookNotFound",
  IncomingWebhookAlreadyExists = "IncomingWebhookAlreadyExists",
  IncomingWebhookDuplicateName = "IncomingWebhookDuplicateName",
  RuleNotFound = "RuleNotFound",
  ApiKeyNotFound = "APIKeyNotFound",
  RuleAlreadyExists = "RuleAlreadyExists",
  RuleDuplicateName = "RuleDuplicateName",
  AuthProviderDuplicateName = "AuthProviderDuplicateName",
  RestrictedHost = "RestrictedHost",
  ApiKeyAlreadyExists = "APIKeyAlreadyExists",
  IncomingWebhookAuthFailed = "IncomingWebhookAuthFailed",
  ExecutionTimeLimitExceeded = "ExecutionTimeLimitExceeded",
  FunctionNotCallable = "FunctionNotCallable",
  UserAlreadyConfirmed = "UserAlreadyConfirmed",
  UserNotFound = "UserNotFound",
  UserDisabled = "UserDisabled",
  Unknown = "Unknown"
}

const apiErrorCodes: { [id: string] : StitchServiceErrorCode } = {};
Object.entries(StitchServiceErrorCode).forEach(([key, value]) => {
  apiErrorCodes[value] = StitchServiceErrorCode[key];
});

export function stitchServiceErrorCodeFromApi(code : string) : StitchServiceErrorCode {
  if (!(code in apiErrorCodes)) {
    return StitchServiceErrorCode.Unknown;
  }
  return apiErrorCodes[code];
}