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
  utf8Slice,
  StitchEvent,
  StitchClientError,
  StitchClientErrorCode
} from "mongodb-stitch-core-sdk";

/** @hidden */
export default class ReaderEventStream extends BaseEventStream<ReaderEventStream> {

  private readerStream: ReadableStream;
  private reader: any;
  private dataBuffer: Array<string>;
  private eventName: string;
  private bufferPos: number;
  private buffer: Array<number>;
  private doneOnce: boolean;

  constructor(
    readerStream: ReadableStream,
    open: boolean,
    reconnecter?: () => Promise<ReaderEventStream>
  ) {
    super(reconnecter);
    this.readerStream = readerStream;

    if (open) {
      this.reset();
    }
  }

  public open(): void {
    if (this.closed) {
      throw new StitchClientError(StitchClientErrorCode.StreamClosed);
    }
    this.reset();
  }

  private reset(): void {
    // When a stream is parsed, a data buffer and an event name buffer must be associated with it.
    // They must be initialized to the empty string
    this.reader = this.readerStream.getReader();
    this.dataBuffer = new Array<string>();
    this.eventName = ""; 
    this.bufferPos = 0;
    this.buffer = new Array<number>();
    this.doneOnce = false;

    this.processLine();
  }

  protected onReconnect(next: ReaderEventStream) {
    this.readerStream = next.readerStream;
    this.reset();
  }

  private readLine(): Promise<{ line: string, ok: boolean }> {
    for (; this.bufferPos < this.buffer.length; this.bufferPos++) {
      let spliceAt = -1;
      if (this.buffer[this.bufferPos] === 0x0D && this.bufferPos + 1 > this.buffer.length && this.buffer[this.bufferPos] === 0x0A) {
        spliceAt = this.bufferPos + 2;
      } else if (this.buffer[this.bufferPos] === 0x0A) {
        spliceAt = this.bufferPos + 1;
      } else if (this.doneOnce && this.buffer[this.bufferPos] === 0x0D) {
        spliceAt = this.bufferPos + 1;
      } else if (this.doneOnce) {
        spliceAt = 0;
      }
      if (spliceAt !== -1) {
         let line = utf8Slice(new Uint8Array(this.buffer.slice(0, this.bufferPos)), 0, this.bufferPos);
          this.buffer.splice(0, spliceAt);
          this.bufferPos = 0;
          return Promise.resolve({ line, ok: true });
      }
    }
    if (this.doneOnce) {
      return Promise.resolve({ line: "", ok: false });
    }
    return this.reader.read().then(result => {
      if (result.done) {
        this.doneOnce = true;
        // read one more time for remaning buffer data.
        return this.readLine();  
      }
      let bytes = result.value;
      for (let idx = 0; idx < bytes.length; idx++) {
         this.buffer.push(bytes[idx]);
      }
      return this.readLine();
    });
  }

  // The steps to process the field given a field name and a field value depend on the field name, as given in the
  // following list. Field names must be compared literally, with no case folding performed.
  private processField(field: string, value: string): void {
    // If the field name is "event"
    if (field === "event") {
      this.eventName = value;
    } 
    // If the field name is "data"
    else if (field === "data") {
       // If the data buffer is not the empty string, then append a single U+000A LINE FEED character to the data buffer.
       if (this.dataBuffer.length !== 0) {
         this.dataBuffer.push('\n');
       }
       for (let i = 0; i < value.length; i++) {
         this.dataBuffer.push(value[i]);  
       }
    }
    // If the field name is "id"
    else if (field === "id") {
      // NOT IMPLEMENTED
    }
    // If the field name is "retry"
    else if (field === "retry") {
      // NOT IMPLEMENTED
    }
    // Otherwise
    else {
      // The field is ignored.
    }
  }

  private dispatchEvent(): void {
    // If the data buffer is an empty string, set the data buffer and the event name buffer to the empty string and abort these steps.
    if (this.dataBuffer.length === 0) {
      this.eventName = "";
      return;
    }

    // If the event name buffer is not the empty string but is also not a valid NCName,
    // set the data buffer and the event name buffer to the empty string and abort these steps.
    // NOT IMPLEMENTED

    // Otherwise, create an event that uses the MessageEvent interface, with the event name message,
    // which does not bubble, is cancelable, and has no default action. The data attribute must be set
    // to the value of the data buffer, the origin attribute must be set to the Unicode serialization of
    // the origin of the event stream's URL, and the lastEventId attribute must be set to the last event ID
    // string of the event source.
    // If the event name buffer has a value other than the empty string, change the type of the newly
    // created event to equal the value of the event name buffer.
    const event = new Event(this.eventName ? this.eventName : Event.MESSAGE_EVENT, this.dataBuffer.join(''));

    // Set the data buffer and the event name buffer to the empty string.
    this.dataBuffer = new Array<string>();
    this.eventName = "";

    // Queue a task to dispatch the newly created event at the EventSource object.
    if (event.eventName === StitchEvent.ERROR_EVENT_NAME) {
      // this deviates from spec
      this.lastErr = event.data;
      this.close();
    }
    this.events.push(event);
    this.poll();
  }

  // Lines must be processed, in the order they are received, as follows:
  private processLine(): void {
    this.readLine().then(result => {
      if (!result.ok) {
        if (this.closed) {
          return;
        }
        this.reconnect();
        return;
      }
      const line = result.line;

      // If the line is empty (a blank line), Dispatch the event, as defined below.
      if (line.length === 0) {
        this.dispatchEvent();
      }
      // If the line starts with a U+003A COLON character (':')
      else if (line.startsWith(":")) {
        // ignore the line
      }
      // If the line contains a U+003A COLON character (':') character
      else if (line.includes(":")) {
        // Collect the characters on the line before the first U+003A COLON character (':'), and let field be that string.
        const colonIdx = line.indexOf(":");
        const field = line.substring(0, colonIdx);

        // Collect the characters on the line after the first U+003A COLON character (':'), and let value be that string.
        // If value starts with a single U+0020 SPACE character, remove it from value.
        let value = line.substring(colonIdx + 1);
        value = value.startsWith(" ") ? value.substring(1) : value;

        // Process the field using the steps described below, using field as the field name and value as the field value.
        this.processField(field, value);
      }
      // Otherwise, the string is not empty but does not contain a U+003A COLON character (':') character
      else {
        // Process the field using the steps described below, using the whole line as the field name, and the empty string as the field value.
        this.processField(line, "");
      }

      this.processLine();
    }).catch(error => this.reconnect(error));
  }

  protected afterClose(): void {
    this.reader.cancel()
  }
}
