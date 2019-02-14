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
        true,
        new Date(),
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

const window = {
    history: {
        replaceState: (data: any, title?: string, url?: string | null) => {
            expect(url).toEqual("http://dummy_test.com");
        }
    },
    location: {
        hash: "",
        host: "dummy_test.com",
        pathname: "",
        protocol: "http:",
        replace: (url: string) => {}
    },
};

describe("StitchAuthImpl", () => {
    it("should handle login with redirect", async () => {
        const authRoutesMock = mock(StitchBrowserAppAuthRoutes)
        const authRoutes = instance(authRoutesMock);

        const mockRequestClient = mock(StitchRequestClient);
        when(mockRequestClient.getBaseURL()).thenResolve("");

        const impl = new StitchAuthImpl(
            instance(mockRequestClient),
            authRoutes,
            emptyStorage,
            instance(mock(StitchAppClientInfo)),
            window
        );

        when(authRoutesMock.getAuthProviderRedirectRoute(
            anything(),
            anything(),
            anything(),
            anything()
        )).thenCall((credential, redirectUrl, state) => {
            expect(credential instanceof GoogleRedirectCredential).toBeTruthy();
            expect(state).toBeDefined();
            
            return "http://dummyRedirectUrl.com";
        });

        window.location.replace = (location: string) => {
            expect(location).toEqual("http://dummyRedirectUrl.com");
        };


        await impl.loginWithRedirect(
            new GoogleRedirectCredential()
        );
        
        expect.assertions(3);
    });

    it("should handle link with redirect", async () => {
        const authRoutesMock = mock(StitchBrowserAppAuthRoutes)
        const authRoutes = instance(authRoutesMock);

        const mockRequestClient = mock(StitchRequestClient);
        when(mockRequestClient.getBaseURL()).thenResolve("");

        const impl = new StitchAuthImpl(
            instance(mockRequestClient),
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
            instance(mock(StitchAppClientInfo)),
            window
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
            expect(state).toBeDefined();
            
            return "http://dummyLinkUrl.com";
        });

        const xStitchLocation = "test_location";

        StitchAuthImpl.injectedFetch = (request: Request) => {
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

        window.location.replace = (location: string) => {
            expect(location).toEqual(xStitchLocation);
        };

        await impl.linkWithRedirectInternal(
            impl.user!, new GoogleRedirectCredential()
        );

        expect.assertions(5);
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
            appClientInfo,
            window
        );

        when(appClientInfoMock.clientAppId).thenReturn("dummy_client_app_id");

        window.location.hash = `#${RedirectFragmentFields.ClientAppId}=dummy_client_app_id` +
        `&${RedirectFragmentFields.State}=dummy_state`;

        expect(impl.hasRedirectResult()).toBeTruthy();
        expect.assertions(3);

        window.location.hash = `https://example.org/#${RedirectFragmentFields.ClientAppId}=bad_client_app_id` +
        `&${RedirectFragmentFields.State}=bad_state`;

        expect(impl.hasRedirectResult()).toBeFalsy();

        expect.assertions(8);
    })

    it("should handle redirect", async () => {
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
            instance(mock(StitchAppClientInfo)),
            window
        )
        
        const spiedImpl = spy(impl);

        const redirectFragmentResult = {
            accessToken: "dummy_access_token",
            deviceId: "dummy_device_id",
            refreshToken: "refresh_token",
            userId: "user_id"
        };

        when(spiedImpl['processRedirectResult'](anything())).thenReturn(
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
