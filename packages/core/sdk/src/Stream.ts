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

import Event from "./internal/net/Event";
import EventListener from "./internal/net/EventListener";
import EventStream from "./internal/net/EventStream";
import StitchEvent from "./internal/net/StitchEvent";
import StreamListener from "./StreamListener";
import { Decoder } from "./internal/common/Codec";

/**
 * A Stream represents an ongoing stream of objects from a remote source, such 
 * as a MongoDB change stream as opened by a call to
 * [[RemoteMongoCollection#watch]].
 * 
 * @typeparam T the type of the objects received by the stream.
 */
export default class Stream<T> {
  private readonly eventStream: EventStream;
  private readonly decoder?: Decoder<T>;

  private listeners: Array<[StreamListener<T>, EventListener]>;

  /** @hidden */
  public constructor(
    eventStream: EventStream,
    decoder?: Decoder<T>
  ) {
    this.eventStream = eventStream;
    this.decoder = decoder;
    this.listeners = [];
  }

  /**
   * Returns the next object received from the stream.
   * 
   * @return a Promise containing the next object received from the stream. If 
   *         there is no object yet available on the stream, the Promise will 
   *         not resolve until there is.
   */
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

  /**
   * Sets up a callback that will be called when objects are received
   * from the stream. This callback cannot be cancelled.
   * 
   * @param callback a function that is to be called whenever objects are 
   *                 received by this stream.
   */
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

  /**
   * Sets up a callback that will be called when this stream produces an error.
   * This callback cannot be cancelled.
   * 
   * @param callback a function that will be called whenever this stream
   *                 produces an error.
   */
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

  /**
   * Registers a [[StreamListener]] object whose onNext method will be called 
   * whenever this stream receives a new object, and whose onError method
   * will be called whenever this stream produces an error. This listener can
   * later be removed by [[removeListener]]
   * 
   * @param listener the listener object to be registered with this Stream
   */
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

  /**
   * Unregisters a listener object previously added to this stream by
   * [[addListener]].
   * 
   * @param listener the listener object to be unregistered with this stream
   */
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

  /**
   * Closes the underlying stream, which will prevent the stream from receiving 
   * any more events.
   */
  public close(): void {
    this.eventStream.close();
  }
}
