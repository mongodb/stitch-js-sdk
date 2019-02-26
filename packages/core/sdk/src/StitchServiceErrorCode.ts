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


/**
 * An enumeration of the types of errors that can come back from a completed 
 * request to the Stitch server. With the exception of "Unknown", these are 
 * the error codes as they are returned by the Stitch server in an error 
 * response.
 */
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
  APIKeyAlreadyExists: StitchServiceErrorCode.ApiKeyAlreadyExists,
  APIKeyNotFound: StitchServiceErrorCode.ApiKeyNotFound,
  AWSError: StitchServiceErrorCode.AWSError,
  ArgumentsNotAllowed: StitchServiceErrorCode.ArgumentsNotAllowed,
  AuthProviderAlreadyExists: StitchServiceErrorCode.AuthProviderAlreadyExists,
  AuthProviderDuplicateName: StitchServiceErrorCode.AuthProviderDuplicateName,
  AuthProviderNotFound: StitchServiceErrorCode.AuthProviderNotFound,
  DomainNotAllowed: StitchServiceErrorCode.DomainNotAllowed,
  ExecutionTimeLimitExceeded: StitchServiceErrorCode.ExecutionTimeLimitExceeded,
  FunctionAlreadyExists: StitchServiceErrorCode.FunctionAlreadyExists,
  FunctionDuplicateName: StitchServiceErrorCode.FunctionDuplicateName,
  FunctionExecutionError: StitchServiceErrorCode.FunctionExecutionError,
  FunctionInvalid: StitchServiceErrorCode.FunctionInvalid,
  FunctionNotCallable: StitchServiceErrorCode.FunctionNotCallable,
  FunctionNotFound: StitchServiceErrorCode.FunctionNotFound,
  FunctionSyntaxError: StitchServiceErrorCode.FunctionSyntaxError,
  GCMError: StitchServiceErrorCode.GCMError,
  HTTPError: StitchServiceErrorCode.HTTPError,
  IncomingWebhookAlreadyExists: StitchServiceErrorCode.IncomingWebhookAlreadyExists,
  IncomingWebhookAuthFailed: StitchServiceErrorCode.IncomingWebhookAuthFailed,
  IncomingWebhookDuplicateName:StitchServiceErrorCode.IncomingWebhookDuplicateName,
  IncomingWebhookNotFound: StitchServiceErrorCode.IncomingWebhookNotFound,
  InternalServerError: StitchServiceErrorCode.InternalServerError,
  InvalidParameter: StitchServiceErrorCode.InvalidParameter,
  InvalidSession: StitchServiceErrorCode.InvalidSession,
  MissingAuthReq: StitchServiceErrorCode.MissingAuthReq,
  MissingParameter: StitchServiceErrorCode.MissingParameter,
  MongoDBError: StitchServiceErrorCode.MongoDBError,
  NoMatchingRuleFound: StitchServiceErrorCode.NoMatchingRuleFound,
  ReadSizeLimitExceeded: StitchServiceErrorCode.ReadSizeLimitExceeded,
  RestrictedHost: StitchServiceErrorCode.RestrictedHost,
  RuleAlreadyExists: StitchServiceErrorCode.RuleAlreadyExists,
  RuleDuplicateName: StitchServiceErrorCode.RuleDuplicateName,
  RuleNotFound: StitchServiceErrorCode.RuleNotFound,
  ServiceAlreadyExists: StitchServiceErrorCode.ServiceAlreadyExists,
  ServiceCommandNotFound: StitchServiceErrorCode.ServiceCommandNotFound,
  ServiceNotFound: StitchServiceErrorCode.ServiceNotFound,
  ServiceTypeNotFound: StitchServiceErrorCode.ServiceTypeNotFound,
  TwilioError: StitchServiceErrorCode.TwilioError,
  UserAlreadyConfirmed: StitchServiceErrorCode.UserAlreadyConfirmed,
  UserAppDomainMismatch: StitchServiceErrorCode.UserAppDomainMismatch,
  UserDisabled: StitchServiceErrorCode.UserDisabled,
  UserNotFound: StitchServiceErrorCode.UserNotFound,
  ValueAlreadyExists: StitchServiceErrorCode.ValueAlreadyExists,
  ValueDuplicateName: StitchServiceErrorCode.ValueDuplicateName,
  ValueNotFound: StitchServiceErrorCode.ValueNotFound
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
