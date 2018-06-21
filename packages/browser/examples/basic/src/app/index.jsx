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

import * as React from "react";
import * as ReactDOM from "react-dom";
import { 
    Stitch, 
    UserPasswordAuthProviderClient, 
    AnonymousCredential,
    GoogleRedirectCredential,
    StitchAppClientConfiguration
} from "mongodb-stitch-browser-sdk";

class Hello extends React.Component {
    callSomeFunction() {
        this.state.client.callFunction("echoArg", [42]).then(result => {
            this.setState({
                value: result["arg"]
            })
        }).catch(err => {
            console.log(err)
        });
    }

    loginWithCredential() {
        this.state.client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
            console.log(user);
            //this.callSomeFunction(this.state.client)
        }).catch(err => {
            console.log(err)
        })
    }

    loginWithRedirect() {
        this.state.client.auth.loginWithRedirect(new GoogleRedirectCredential())
    }

    linkWithRedirect() {
        console.log(`Linking while user: ${this.state.client.auth.user}`);
        this.state.client.auth.user.linkUserWithRedirect(
            new GoogleRedirectCredential()
        )
    }

    logout() {
        this.state.client.auth.logout().then(() => {
            console.log(`successfully logged out`);
        }).catch(err => {
            console.log(err)
        })
    }

    componentDidMount() {
        const client = Stitch.initializeDefaultAppClient(
            "test-js-sdk-eocey",
            new StitchAppClientConfiguration.Builder()
                .withBaseURL("https://stitch-dev.mongodb.com")
                .build()
        );

        if (client.auth.hasRedirectResult()) {
            client.auth.handleRedirectResult().then(user => {
                console.log(`successfully logged in as redirected user with id: ${user.id}`)
                console.log(`profile: ${JSON.stringify(user.profile)}`)
            })
        }

        console.log(client.auth.user);

        this.state.client = client;
    }

    constructor(props) {
        super(props);

        this.state = {
            value: "...loading"
        };

        this.loginWithRedirect = this.loginWithRedirect.bind(this);
        this.loginWithCredential = this.loginWithCredential.bind(this);
        this.linkWithRedirect = this.linkWithRedirect.bind(this);
        this.logout = this.logout.bind(this);
    }
    
    render() {
        return (
            <div>
                <div style={{width:"50%"}}>{this.state.value}</div>
                <div>
                    <button className="button" onClick={this.loginWithCredential}>login anonymously</button>
                </div>
                <div>
                    <button className="button" onClick={this.loginWithRedirect}>login with redirect</button>
                </div>
                <div>
                    <button className="button" onClick={this.linkWithRedirect}>link with redirect</button>
                </div>
                <div>
                    <button className="button" onClick={this.logout}>logout</button>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
  <Hello compiler="JS" framework="React" />,
  document.getElementById("root")
);
