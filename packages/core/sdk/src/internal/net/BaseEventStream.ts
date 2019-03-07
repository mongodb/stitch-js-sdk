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

import StitchError from "../../StitchError";
import StitchRequestError from "../../StitchRequestError";
import Event from "./Event";
import EventListener from "./EventListener";
import EventStream from "./EventStream";
import StitchEvent from "./StitchEvent";

/** @hidden */
export default abstract class BaseEventStream<T extends BaseEventStream<T>> implements EventStream {

  protected static readonly RETRY_TIMEOUT_MILLIS = 5000;
  protected closed: boolean;
  protected events: Event[];
  protected listeners: EventListener[];
  protected lastErr?: string;

  private readonly reconnecter?: () => Promise<T>;

  constructor(reconnecter?: () => Promise<T>) {
    this.reconnecter = reconnecter;
    this.closed = false;
    this.events = [];
    this.listeners = [];
    this.lastErr = undefined;
  }

  public isOpen(): boolean {
    return !this.closed;
  }

  public abstract open(): void;

  public addListener(listener: EventListener): void {
    if (this.closed) {
      setTimeout(() => listener.onEvent(new Event(StitchEvent.ERROR_EVENT_NAME, "stream closed")), 0)
      return;
    }
    if (this.lastErr !== undefined) {
      setTimeout(() => listener.onEvent(new Event(StitchEvent.ERROR_EVENT_NAME, this.lastErr!)), 0)
      return;
    }
    this.listeners.push(listener);
    this.poll();
  }

  public removeListener(listener: EventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index === -1) {
      return;
    }
    this.listeners.splice(index, 1);
  }

  public nextEvent(): Promise<Event> {
    if (this.closed) {
      return Promise.reject(new Event(StitchEvent.ERROR_EVENT_NAME, "stream closed"));
    }
    if (this.lastErr !== undefined) {
      return Promise.reject(new Event(StitchEvent.ERROR_EVENT_NAME, this.lastErr!))
    }
    return new Promise<Event>((resolve, reject) => {
      this.listenOnce({
        onEvent: e => { 
          resolve(e);
        }
      })
    });
  }

  public close(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.afterClose();
  }

  protected abstract afterClose(): void;

  protected abstract onReconnect(next: T): void;

  protected reconnect(error?: Error): void {
    if (!this.reconnecter) {
      if (!this.closed) {
        this.closed = true;
        this.events.push(new Event(StitchEvent.ERROR_EVENT_NAME, `stream closed: ${error}`));
        this.poll();
      }
      return;
    }
    this.reconnecter!()
    .then(next => {
      this.onReconnect(next)
    })
    .catch(e => {
      if (!(e instanceof StitchError) || !(e instanceof StitchRequestError)) {
        this.closed = true;
        this.events.push(new Event(StitchEvent.ERROR_EVENT_NAME, `stream closed: ${error}`));
        this.poll();
        return; 
      }
      setTimeout(() => this.reconnect(e), BaseEventStream.RETRY_TIMEOUT_MILLIS);
    })
  }

  protected poll(): void {
    while (this.events.length !== 0) {
      const event = this.events.pop()!;  
      for (const listener of this.listeners) {
        if (listener.onEvent) {
          listener.onEvent(event);        
        }
      }
    }
  }

  private listenOnce(listener: EventListener): void {
    if (this.closed) {
      setTimeout(() => listener.onEvent(new Event(StitchEvent.ERROR_EVENT_NAME, "stream closed")), 0)
      return;
    }
    if (this.lastErr !== undefined) {
      setTimeout(() => listener.onEvent(new Event(StitchEvent.ERROR_EVENT_NAME, this.lastErr!)), 0)
      return;
    }
    const wrapper = {
      onEvent: e => {
        this.removeListener(wrapper);
        listener.onEvent(e);
      }
    };
    this.addListener(wrapper);
  }
}
