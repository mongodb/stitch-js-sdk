import { RebindEvent } from "./RebindEvent";

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
 * An interface that allows any service of any type to bind to its 
 * associated [[CoreStitchServiceClient]].
 */
export default interface StitchServiceBinder {
    /**
     * Notify the binder that a rebind event has occurred. E.g. a change in the
     * active user.
     * 
     * @param rebindEvent The rebind event that occurred.
     */
    onRebindEvent(rebindEvent: RebindEvent)
}
