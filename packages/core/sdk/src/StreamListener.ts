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
  * An interface defining a listener for the [[Stream]] type.
  * 
  * @typeparam T the type of objects received by the stream with which this 
  *              listener is registered.
  */
export default interface StreamListener<T> {
  /**
   * Called whenever the stream with which this listener is registered receives
   * an object from the remote source.
   * @param data the object received by the stream
   */
  onNext(data: T): void;

  /**
   * Called whenever the stream with which this listener is registered produces
   * an error.
   * @param error the error produced by the stream
   */
  onError(error: Error): void;
}
