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
  Event,
  BaseEventStream,
  StitchEvent,
  StitchClientError,
  StitchClientErrorCode
} from "mongodb-stitch-core-sdk";

/** @hidden */
export default class EventSourceEventStream extends BaseEventStream<EventSourceEventStream> {

  private evtSrc: EventSource;
  private readonly onOpenError: (error: Error) => void;
  private openedOnce: boolean;

  constructor(
    evtSrc: EventSource,
    onOpen: (stream: EventSourceEventStream) => void,
    onOpenError: (error: Error) => void,
    reconnecter?: () => Promise<EventSourceEventStream>
  ) {
    super(reconnecter);
    this.evtSrc = evtSrc;
    this.onOpenError = onOpenError;
    this.openedOnce = false;

    this.evtSrc.onopen = e => {
      onOpen(this);
      this.openedOnce = true;
    };
    this.reset();
  }

  public open(): void {
    if (this.closed) {
      throw new StitchClientError(StitchClientErrorCode.StreamClosed);
    }
  }

  private reset(): void {
    this.evtSrc.onmessage = e => {
      this.events.push(new Event(Event.MESSAGE_EVENT, e.data));
      this.poll();
    };
    this.evtSrc.onerror = e => {
      if (e instanceof MessageEvent) {
        this.lastErr = e.data;
        this.events.push(new Event(StitchEvent.ERROR_EVENT_NAME, this.lastErr!));
        this.close();
        this.poll();
        return;
      }
      if (!this.openedOnce) {
        this.close();
        this.onOpenError(new Error("event source failed to open and will not reconnect; check network log for more details"));
        return;
      }
      this.evtSrc.close();
      this.reconnect();
    }
  }

  protected onReconnect(next: EventSourceEventStream) {
    this.evtSrc = next.evtSrc;
    this.reset();
    this.events = next.events.concat(this.events);
  }

  public afterClose(): void {
    this.evtSrc.close();
  }
}
