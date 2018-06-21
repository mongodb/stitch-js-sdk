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

import { Method, StitchAppClientInfo, StitchAuthCredential, StitchRequestClient } from "mongodb-stitch-core-sdk";
import { anything, capture, instance, mock, spy, verify, when } from "ts-mockito";
import { Matcher } from "ts-mockito/lib/matcher/type/Matcher";
import RedirectKeys from "../../../core/src/core/auth/internal/RedirectKeys";
import StitchAuthImpl from "../../../core/src/core/auth/internal/StitchAuthImpl";
import StitchBrowserAppAuthRoutes from "../../../core/src/core/auth/internal/StitchBrowserAppAuthRoutes";
import StitchUserImpl from "../../../core/src/core/auth/internal/StitchUserImpl";

Object.defineProperty(
    window, 
    "history", 
    { 
        value: {
            replaceState: () => {}
        }, 
        writable: true 
    }
);

export class RequestClassMatcher extends Matcher {
    constructor(
      private readonly pathRegEx?: RegExp,
      private readonly method?: Method
    ) {
      super();
    }
  
    public match(value: any): boolean {
        if (this.pathRegEx && !this.pathRegEx.test(value.path)) {
          return false;
        }
  
        if (this.method && this.method !== value.method) {
          return false;
        }
  
        return true;
    }
  
    public toString(): string {
      return `Did not match ${this.pathRegEx} or method ${this.method}`;
    }
  }

describe("StitchAuthImpl", () => {
    it("should handleRedirect", async () => {
        const impl = new StitchAuthImpl(
            instance(mock(StitchRequestClient)),
            instance(mock(StitchBrowserAppAuthRoutes)),
            {
                get(key: string): string {
                    if (key === RedirectKeys.RedirectProvider) {
                        return "test_provider"
                    }
    
                    return "";
                },
    
                set(key: string, value: string) {
    
                },
    
                remove(key: string) {
    
                }
            },
            instance(mock(StitchAppClientInfo))
        )
        const spiedImpl = spy(impl);

        const redirectResult = { 
            clientAppId: "<clientAppId>",
            found: true,
            lastError: undefined,
            stateValid: true,
            ua: {
                accessToken: "accessToken",
                deviceId: "deviceId",
                refreshToken: "refreshToken",
                userId: "userId"
            }
        };

        when(spiedImpl['processRedirectResult']()).thenReturn(
            redirectResult as any
        )

        when(spiedImpl.loginWithCredentialInternal(anything()))
            .thenResolve(instance(mock(StitchUserImpl)))

        await impl.handleRedirectResult()

        const [credential] = capture(spiedImpl.loginWithCredentialInternal).last();

        expect(credential instanceof StitchAuthCredential).toBeTruthy();
        expect(credential.providerName).toEqual("test_provider");
        expect(credential.providerType).toEqual("test_provider");
        expect((credential as StitchAuthCredential).authInfo).toEqual(redirectResult.ua);        
    })
});
