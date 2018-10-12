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

import Event from "./Event";
import EventListener from "./EventListener";
import EventStream from "./EventStream";
import StitchEvent from "./StitchEvent";
import StreamListener from "./StreamListener";
import { Decoder } from "../common/Codec";

/** @hidden */
export default class Stream<T> {

  private readonly eventStream: EventStream;
  private readonly decoder?: Decoder<T>;

  private listeners: Array<[StreamListener<T>, EventListener]>;

  public constructor(
    eventStream: EventStream,
    decoder?: Decoder<T>
  ) {
    this.eventStream = eventStream;
    this.decoder = decoder;
    this.listeners = [];
  }

  public next(): Promise<T> {
    return this.eventStream.nextEvent()
      .then(event => {
        const se = StitchEvent.fromEvent(event, this.decoder);
        if (se.eventName === StitchEvent.ERROR_EVENT_NAME) {
          throw se.error;
        }
        if (se.eventName === Event.MESSAGE_EVENT) {
          return se.data;          
        }
        return this.next();
      });
  }

  public onNext(callback: (data: T) => void): void {
    const wrapper = {
      onEvent: e => {
        const se = StitchEvent.fromEvent(e, this.decoder);
        if (se.eventName !== Event.MESSAGE_EVENT) {
          return;
        }
        callback(se.data);
      }
    };
    this.eventStream.addListener(wrapper);
  }

  public onError(callback: (error: Error) => void): void {
    const wrapper = {
      onEvent: e => {
        const se = StitchEvent.fromEvent(e, this.decoder);
        if (se.eventName === StitchEvent.ERROR_EVENT_NAME) {
          callback(se.error);
        }
      }
    };
    this.eventStream.addListener(wrapper);
  }

  public addListener(listener: StreamListener<T>): void {
    const wrapper = {
      onEvent: e => {
        const se = StitchEvent.fromEvent(e, this.decoder);
        if (se.eventName === StitchEvent.ERROR_EVENT_NAME) {
          if (listener.onError) {
            listener.onError(se.error);
          }
        } else {
          if (listener.onNext) {
            listener.onNext(se.data);
          }
        }
      }
    };
    this.listeners.push([listener, wrapper]);
    this.eventStream.addListener(wrapper);
  }

  public removeListener(listener: StreamListener<T>): void {
    let index = -1;
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i][0] === listener) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      return;
    }
    const wrapper = this.listeners[index][1];
    this.listeners.splice(index, 1);
    this.eventStream.removeListener(wrapper);
  }

  public close(): void {
    this.eventStream.close();
  }
}
