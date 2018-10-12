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

import { fromByteArray, toByteArray } from "base64-js";

// sourced from https://github.com/coolaj86/TextEncoderLite
/** @hidden */
export function base64Decode(str: string) {
  const unevenBytes = str.length % 4;
  let strToDecode;
  if (unevenBytes != 0) {
    const paddingNeeded = 4 - unevenBytes;
    strToDecode = str + "=".repeat(paddingNeeded);
  } else {
    strToDecode = str;
  }
  const bytes = toByteArray(strToDecode);
  return utf8Slice(bytes, 0, bytes.length);
}

/** @hidden */
export function base64Encode(str: string) {
  let result;
  if ("undefined" === typeof Uint8Array) {
    result = utf8ToBytes(str);
  }
  result = new Uint8Array(utf8ToBytes(str));
  return fromByteArray(result);
}

// sourced from https://github.com/feross/buffer
function utf8ToBytes(string: string) {
  let units = Infinity;
  let codePoint;
  let length = string.length;
  let leadSurrogate = null;
  let bytes: number[] = [];
  let i = 0;

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xd7ff && codePoint < 0xe000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xdc00) {
          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
          leadSurrogate = codePoint;
          continue;
        } else {
          // valid surrogate pair
          codePoint =
            ((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00) | 0x10000;
          leadSurrogate = null;
        }
      } else {
        // no lead yet

        if (codePoint > 0xdbff) {
          // unexpected trail
          if ((units -= 3) > -1) {
            bytes.push(0xef, 0xbf, 0xbd);
          }
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) {
            bytes.push(0xef, 0xbf, 0xbd);
          }
          continue;
        } else {
          // valid lead
          leadSurrogate = codePoint;
          continue;
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) {
        bytes.push(0xef, 0xbf, 0xbd);
      }
      leadSurrogate = null;
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) {
        break;
      }
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) {
        break;
      }
      bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) {
        break;
      }
      bytes.push(
        (codePoint >> 0xc) | 0xe0,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      );
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) {
        break;
      }
      bytes.push(
        (codePoint >> 0x12) | 0xf0,
        ((codePoint >> 0xc) & 0x3f) | 0x80,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      );
    } else {
      throw new Error("Invalid code point");
    }
  }

  return bytes;
}

export function utf8Slice(buf: Uint8Array, start: number, end: number) {
  let res = "";
  let tmp = "";
  end = Math.min(buf.length, end || Infinity);
  start = start || 0;

  for (let i = start; i < end; i++) {
    if (buf[i] <= 0x7f) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
      tmp = "";
    } else {
      tmp += "%" + buf[i].toString(16);
    }
  }

  return res + decodeUtf8Char(tmp);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xfffd); // UTF 8 invalid char
  }
}
