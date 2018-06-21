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
  MissingAuthReq,
  InvalidSession, // Invalid session, expired, no associated user, or app domain mismatch,
  UserAppDomainMismatch,
  DomainNotAllowed,
  ReadSizeLimitExceeded,
  InvalidParameter,
  MissingParameter,
  TwilioError,
  GCMError,
  HTTPError,
  AWSError,
  MongoDBError,
  ArgumentsNotAllowed,
  FunctionExecutionError,
  NoMatchingRuleFound,
  InternalServerError,
  AuthProviderNotFound,
  AuthProviderAlreadyExists,
  ServiceNotFound,
  ServiceTypeNotFound,
  ServiceAlreadyExists,
  ServiceCommandNotFound,
  ValueNotFound,
  ValueAlreadyExists,
  ValueDuplicateName,
  FunctionNotFound,
  FunctionAlreadyExists,
  FunctionDuplicateName,
  FunctionSyntaxError,
  FunctionInvalid,
  IncomingWebhookNotFound,
  IncomingWebhookAlreadyExists,
  IncomingWebhookDuplicateName,
  RuleNotFound,
  ApiKeyNotFound,
  RuleAlreadyExists,
  RuleDuplicateName,
  AuthProviderDuplicateName,
  RestrictedHost,
  ApiKeyAlreadyExists,
  IncomingWebhookAuthFailed,
  ExecutionTimeLimitExceeded,
  FunctionNotCallable,
  UserAlreadyConfirmed,
  UserNotFound,
  UserDisabled,
  Unknown
}

const apiErrorCodes: { [id: string]: StitchServiceErrorCode } = {
  MissingAuthReq: StitchServiceErrorCode.MissingAuthReq,
  InvalidSession: StitchServiceErrorCode.InvalidSession,
  UserAppDomainMismatch: StitchServiceErrorCode.UserAppDomainMismatch,
  DomainNotAllowed: StitchServiceErrorCode.DomainNotAllowed,
  ReadSizeLimitExceeded: StitchServiceErrorCode.ReadSizeLimitExceeded,
  InvalidParameter: StitchServiceErrorCode.InvalidParameter,
  MissingParameter: StitchServiceErrorCode.MissingParameter,
  TwilioError: StitchServiceErrorCode.TwilioError,
  GCMError: StitchServiceErrorCode.GCMError,
  HTTPError: StitchServiceErrorCode.HTTPError,
  AWSError: StitchServiceErrorCode.AWSError,
  MongoDBError: StitchServiceErrorCode.MongoDBError,
  ArgumentsNotAllowed: StitchServiceErrorCode.ArgumentsNotAllowed,
  FunctionExecutionError: StitchServiceErrorCode.FunctionExecutionError,
  NoMatchingRuleFound: StitchServiceErrorCode.NoMatchingRuleFound,
  InternalServerError: StitchServiceErrorCode.InternalServerError,
  AuthProviderNotFound: StitchServiceErrorCode.AuthProviderNotFound,
  AuthProviderAlreadyExists: StitchServiceErrorCode.AuthProviderAlreadyExists,
  ServiceNotFound: StitchServiceErrorCode.ServiceNotFound,
  ServiceTypeNotFound: StitchServiceErrorCode.ServiceTypeNotFound,
  ServiceAlreadyExists: StitchServiceErrorCode.ServiceAlreadyExists,
  ServiceCommandNotFound: StitchServiceErrorCode.ServiceCommandNotFound,
  ValueNotFound: StitchServiceErrorCode.ValueNotFound,
  ValueAlreadyExists: StitchServiceErrorCode.ValueAlreadyExists,
  ValueDuplicateName: StitchServiceErrorCode.ValueDuplicateName,
  FunctionNotFound: StitchServiceErrorCode.FunctionNotFound,
  FunctionAlreadyExists: StitchServiceErrorCode.FunctionAlreadyExists,
  FunctionDuplicateName: StitchServiceErrorCode.FunctionDuplicateName,
  FunctionSyntaxError: StitchServiceErrorCode.FunctionSyntaxError,
  FunctionInvalid: StitchServiceErrorCode.FunctionInvalid,
  IncomingWebhookNotFound: StitchServiceErrorCode.IncomingWebhookNotFound,
  IncomingWebhookAlreadyExists:
    StitchServiceErrorCode.IncomingWebhookAlreadyExists,
  IncomingWebhookDuplicateName:
    StitchServiceErrorCode.IncomingWebhookDuplicateName,
  RuleNotFound: StitchServiceErrorCode.RuleNotFound,
  APIKeyNotFound: StitchServiceErrorCode.ApiKeyNotFound,
  RuleAlreadyExists: StitchServiceErrorCode.RuleAlreadyExists,
  RuleDuplicateName: StitchServiceErrorCode.RuleDuplicateName,
  AuthProviderDuplicateName: StitchServiceErrorCode.AuthProviderDuplicateName,
  RestrictedHost: StitchServiceErrorCode.RestrictedHost,
  APIKeyAlreadyExists: StitchServiceErrorCode.ApiKeyAlreadyExists,
  IncomingWebhookAuthFailed: StitchServiceErrorCode.IncomingWebhookAuthFailed,
  ExecutionTimeLimitExceeded: StitchServiceErrorCode.ExecutionTimeLimitExceeded,
  FunctionNotCallable: StitchServiceErrorCode.FunctionNotCallable,
  UserAlreadyConfirmed: StitchServiceErrorCode.UserAlreadyConfirmed,
  UserNotFound: StitchServiceErrorCode.UserNotFound,
  UserDisabled: StitchServiceErrorCode.UserDisabled
};

/** @hidden */
export function stitchServiceErrorCodeFromApi(
  code: string
): StitchServiceErrorCode {
  if (!(code in apiErrorCodes)) {
    return StitchServiceErrorCode.Unknown;
  }
  return apiErrorCodes[code];
}
