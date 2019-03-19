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

import { EJSON } from "bson";
import StitchServiceError from "../../StitchServiceError";
import { StitchServiceErrorCode, stitchServiceErrorCodeFromApi } from "../../StitchServiceErrorCode";
import { Decoder } from "../common/Codec";
import Event from "./Event";
import EventStream from "./EventStream";

/** @hidden */
export default class StitchEvent<T> {

  public static readonly ERROR_EVENT_NAME = "error";

  public static fromEvent<T>(
    event: Event,
    decoder?: Decoder<T>): StitchEvent<T> {
    return new StitchEvent<T>(event.eventName, event.data, decoder);
  }

  public readonly eventName: string;
  public readonly data: T;
  public readonly error: StitchServiceError;

  private constructor(
    eventName: string,
    data: string,
    decoder?: Decoder<T>
  ) {
    this.eventName = eventName;

    data = data ? data : "";
    const decodedStringBuffer: string[] = [];
    for (let chIdx = 0; chIdx < data.length; chIdx++) {
      const c = data[chIdx];
      switch (c) {
        case '%':
          if (chIdx + 2 >= data.length) {
            break;
          }
          const code = data.substring(chIdx + 1, chIdx + 3);
          let found: boolean;
          switch (code) {
            case "25":
              found = true;
              decodedStringBuffer.push("%");
              break;
            case "0A":
              found = true;
              decodedStringBuffer.push("\n");
              break;
            case "0D":
              found = true;
              decodedStringBuffer.push("\r");
              break;
            default:
              found = false;
          }
          if (found) {
            chIdx += 2;
            continue;
          }
          break;
        default:
          break;
      }
      decodedStringBuffer.push(c);
    }
    const decodedData = decodedStringBuffer.join('');

    switch (this.eventName) {
      case StitchEvent.ERROR_EVENT_NAME:
        let errorMsg: string;
        let errorCode: StitchServiceErrorCode;

        try {
          /* 
           * parse the error as json
           * if it is not valid json, parse the body as seen in
           * StitchError#handleRequestError
           */
          const errorDoc = EJSON.parse(decodedData, { strict: false });
          errorMsg = errorDoc[ErrorFields.Error];
          errorCode = stitchServiceErrorCodeFromApi(errorDoc[ErrorFields.ErrorCode]);
        } catch (error) {
          errorMsg = decodedData;
          errorCode = StitchServiceErrorCode.Unknown;
        }
        this.error = new StitchServiceError(errorMsg, errorCode);
        break;
      case Event.MESSAGE_EVENT:
        this.data = EJSON.parse(decodedData, { strict: false });
        if (decoder) {
          this.data = decoder.decode(this.data);
        }
        break;
    }
  }
}

enum ErrorFields {
  Error = "error",
  ErrorCode = "error_code",
}
