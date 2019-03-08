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

import { Stream, BaseEventStream, Decoder, Event, EventStream } from "../src";
import { mock, when } from "ts-mockito";

// prevent Jest from thinking this file is an empty test suite
it('should pass', () => {})

class TestStream <T> extends Stream<T> {
  closeCalled: number
  
  constructor(eventStream: EventStream, decoder: Decoder<T>) {
    super(eventStream, decoder)
    this.closeCalled = 0;
  }

  close() {
    this.closeCalled += 1;
    super.close();
  }
}

/**
 * Utility methods for working with streams in tests by creating a real 
 * {@link Stream} object with a mocked {@link EventStream} underneath.
 */
class StreamTestUtils {
  public static createStream<T>(
    decoder: Decoder<T> | undefined,
    ...content: string[]
  ): Stream<T> {
    return this.doCreateStream(decoder, true, content);
  }

  public static createClosedStream<T>(
    decoder: Decoder<T> | undefined,
    ...content: string[]
  ): Stream<T> {
    return this.doCreateStream(decoder, false, content);
  }

  private static doCreateStream<T>(
    decoder: Decoder<T> | undefined, 
    open: boolean, 
    streamEvents: string[],
  ): Stream<T> {
    const eventStream = mock(BaseEventStream);

    if (open) {
      when(eventStream.nextEvent()).thenResolve(
        ...streamEvents.map(s => new Event(Event.MESSAGE_EVENT, s))
      );
    }

    when(eventStream.isOpen()).thenReturn(open);

    return new TestStream(eventStream, decoder)
  }
}

export {
  StreamTestUtils,
  TestStream
}
