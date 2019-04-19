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

import { OperationType } from "./OperationType";
import UpdateDescription from "./UpdateDescription";

/**
 * Represents a change event communicated via a MongoDB change stream from 
 * Stitch when watchCompact is called. These change events omit full documents 
 * from the event for updates, as well as other fields that are unnecessary in 
 * the context of Stitch.
 * 
 * @type T The underlying type of documents on the collection for which this 
 *         change event was produced.
 */
export default interface CompactChangeEvent<T> {
  readonly operationType: OperationType;
  readonly fullDocument?: T;
  readonly documentKey: object;
  readonly updateDescription?: UpdateDescription;
  readonly stitchDocumentVersion?: object;
  readonly stitchDocumentHash?: number;
}
