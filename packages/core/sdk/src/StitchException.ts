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


// sourced from https://github.com/Microsoft/TypeScript/issues/10166
interface ErrorConstructor {
  new (message:string) : Error;
}

const _Error = function(message:string) {
  Error.call(this, message);
  Error.captureStackTrace(this);

  this.message = message;
  this.name = this.constructor.name;
} as any as ErrorConstructor;
_Error.prototype = Object.create(Error.prototype);

/**
 * StitchExceptions represent a class of exceptions that happen while utilizing the Stitch SDK and
 * communicating Stitch. Most Stitch exception types will inherit from this base class.
 */
export default class StitchException extends _Error {}
