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

import { GoogleRedirectCredential } from "mongodb-stitch-browser-core";
import { StitchAppClientInfo, StitchAuthCredential, StitchRequestClient, StitchUserProfileImpl } from "mongodb-stitch-core-sdk";
import { anything, capture, instance, mock, spy, when } from "ts-mockito";
import RedirectFragmentFields from "../../../core/src/core/auth/internal/RedirectFragmentFields";
import RedirectKeys from "../../../core/src/core/auth/internal/RedirectKeys";
import StitchAuthImpl from "../../../core/src/core/auth/internal/StitchAuthImpl";
import StitchBrowserAppAuthRoutes from "../../../core/src/core/auth/internal/StitchBrowserAppAuthRoutes";
import StitchUserImpl from "../../../core/src/core/auth/internal/StitchUserImpl";

function getMockUser(auth: StitchAuthImpl) {
    return new StitchUserImpl(
        "test_id", 
        "test_provider", 
        "test_provider",
        instance(mock(StitchUserProfileImpl)),
        auth
    )
}

const emptyStorage = {
    get(key: string): string {
        return "";
    },

    set(key: string, value: string) {

    },

    remove(key: string) {

    }
};

describe("StitchAuthImpl", () => {
    it("should handle login with redirect", async () => {
        const authRoutesMock = mock(StitchBrowserAppAuthRoutes)
        const authRoutes = instance(authRoutesMock);

        const impl = new StitchAuthImpl(
            instance(mock(StitchRequestClient)),
            authRoutes,
            emptyStorage,
            instance(mock(StitchAppClientInfo))
        );

        when(authRoutesMock.getAuthProviderRedirectRoute(
            anything(),
            anything(),
            anything(),
            anything()
        )).thenCall((credential, redirectUrl, state) => {
            expect(credential instanceof GoogleRedirectCredential).toBeTruthy();
            expect(redirectUrl).toEqual("//"); // set in pageRootUrl
            expect(state).toBeDefined();
            
            return "http://dummyRedirectUrl.com";
        });

        Object.defineProperty(
            window, 
            "location", 
            { 
                value: {
                    replace: (location: string) => {
                        expect(location).toEqual("http://dummyRedirectUrl.com");
                    }
                }, 
                writable: true 
            }
        );

        await impl.loginWithRedirect(
            new GoogleRedirectCredential()
        );

        expect.assertions(4);
    });

    it("should handle link with redirect", async () => {
        const authRoutesMock = mock(StitchBrowserAppAuthRoutes)
        const authRoutes = instance(authRoutesMock);

        const impl = new StitchAuthImpl(
            instance(mock(StitchRequestClient)),
            authRoutes,
            {
                get(key: string): string {
                    if (key === RedirectKeys.ProviderName) {
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
        );

        const spiedImpl = spy(impl);

        when(spiedImpl.user).thenReturn(getMockUser(impl));
        when(spiedImpl.authInfo).thenReturn({accessToken: "test_access_token"} as any);

        when(authRoutesMock.getAuthProviderLinkRedirectRoute(
            anything(),
            anything(),
            anything(),
            anything()
        )).thenCall((credential, redirectUrl, state) => {
            expect(credential instanceof GoogleRedirectCredential).toBeTruthy();
            expect(redirectUrl).toEqual("//"); // set in pageRootUrl
            expect(state).toBeDefined();
            
            return "http://dummyLinkUrl.com";
        });


        const xStitchLocation = "test_location";

        global['fetch'] = (request: Request) => {
            expect(request.headers.get("Authorization")).toEqual("Bearer " + "test_access_token");
            return Promise.resolve({
                headers: {
                    "X-Stitch-Location": xStitchLocation,
                    get: (header: string): string => {
                        expect(header).toEqual("X-Stitch-Location");
                        return xStitchLocation;
                    }
                }
            })
        }

        Object.defineProperty(
            window, 
            "location", 
            { 
                value: {
                    replace: (location: string) => {
                        expect(location).toEqual(xStitchLocation);
                    }
                }, 
                writable: true 
            }
        );

        await impl.linkWithRedirectInternal(
            impl.user!, new GoogleRedirectCredential()
        );

        expect.assertions(6);
    });

    it("should have redirect and process result", async () => {
        const authRoutesMock = mock(StitchBrowserAppAuthRoutes)
        const authRoutes = instance(authRoutesMock);

        const appClientInfoMock = mock(StitchAppClientInfo);
        const appClientInfo = instance(appClientInfoMock)

        const impl = new StitchAuthImpl(
            instance(mock(StitchRequestClient)),
            authRoutes,
            {
                get(key: string): string {
                    if (key === RedirectKeys.State) {
                        expect(key).toEqual(RedirectKeys.State);
                        return "dummy_state"
                    }
                    return ""
                },
                set(key: string, value: any) {},
                remove(key: string) {
                    const expectedKeys = 
                        [RedirectKeys.State, RedirectKeys.ProviderType, RedirectKeys.ProviderName];

                    expect(expectedKeys.indexOf(key as any)).not.toEqual(-1);
                },
            },
            appClientInfo
        );

        when(appClientInfoMock.clientAppId).thenReturn("dummy_client_app_id");

        Object.defineProperty(
            window, 
            "location", 
            { 
                value: {
                    hash: `#${RedirectFragmentFields.ClientAppId}=dummy_client_app_id` +
                    `&${RedirectFragmentFields.State}=dummy_state`
                }, 
                writable: true 
            }
        );

        Object.defineProperty(
            window, 
            "history", 
            { 
                value: {
                    replaceState: (data, title, url) => {
                        expect(data).toBe(null);
                        expect(title).toBe("");
                        expect(url).toBe("//");
                    }
                }, 
                writable: true 
            }
        );

        expect(impl.hasRedirectResult()).toBeTruthy();
        expect.assertions(5);

        Object.defineProperty(
            window, 
            "location", 
            { 
                value: {
                    hash: `#${RedirectFragmentFields.ClientAppId}=bad_client_app_id` +
                    `&${RedirectFragmentFields.State}=bad_state`
                }, 
                writable: true 
            }
        );

        expect(impl.hasRedirectResult()).toBeFalsy();

        expect.assertions(10);
    })

    it("should handleRedirect", async () => {
        const impl = new StitchAuthImpl(
            instance(mock(StitchRequestClient)),
            instance(mock(StitchBrowserAppAuthRoutes)),
            {
                get(key: string): string {
                    if (key === RedirectKeys.ProviderName) {
                        // increase assertion count
                        expect(key).toEqual(RedirectKeys.ProviderName);
                        return "test_provider_name"
                    }
                    if (key === RedirectKeys.ProviderType) {
                        // increase assertion count
                        expect(key).toEqual(RedirectKeys.ProviderType);
                        return "test_provider_type"
                    }
                    return ""
                },
                set(key: string, value: any) {},
                remove(key: string) {
                    const expectedKeys = 
                        [RedirectKeys.State, RedirectKeys.ProviderType, RedirectKeys.ProviderName];

                    expect(expectedKeys.indexOf(key as any)).not.toEqual(-1);
                },
            },
            instance(mock(StitchAppClientInfo))
        )
        const spiedImpl = spy(impl);

        const redirectFragmentResult = {
            accessToken: "dummy_access_token",
            deviceId: "dummy_device_id",
            refreshToken: "refresh_token",
            userId: "user_id"
        };

        when(spiedImpl['processRedirectResult']()).thenReturn(
            redirectFragmentResult as any
        )

        when(spiedImpl.loginWithCredentialInternal(anything()))
            .thenResolve(instance(mock(StitchUserImpl)))

        await impl.handleRedirectResult()

        const [credential] = capture(spiedImpl.loginWithCredentialInternal).last();

        expect(credential instanceof StitchAuthCredential).toBeTruthy();
        expect(credential.providerName).toEqual("test_provider_name");
        expect(credential.providerType).toEqual("test_provider_type");
        expect((credential as StitchAuthCredential).authInfo).toEqual(redirectFragmentResult);

        expect.assertions(6)
    })
});
