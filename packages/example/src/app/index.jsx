import * as React from "react";
import * as ReactDOM from "react-dom";
import { 
    Stitch, 
    StitchAppClientConfiguration, 
    UserPasswordAuthProviderClient, 
    MemoryStorage, 
    GoogleRedirectCredential,
    AnonymousCredential
} from "stitch-web";
import * as css from "./main.css";

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
            console.log(`successfully logged in as anonymous user with id: ${user.id}`)
            console.log(`profile: ${JSON.stringify(user.profile)}`)
            this.callSomeFunction(this.state.client)
        }).catch(err => {
            console.log(err)
        })
    }

    loginWithRedirect() {
        this.state.client.auth.loginWithRedirect(new GoogleRedirectCredential())
    }

    linkWithRedirect() {
        this.state.client.auth.linkUserWithRedirect(
            this.state.client.auth.user, 
            new GoogleRedirectCredential()
        )
    }

    constructor(props) {
        super(props);

        Stitch.initialize()

        const config = StitchAppClientConfiguration.Builder
                        .forApp("test-js-sdk-ikwas")
        Stitch.initializeDefaultAppClient(config);

        const client = Stitch.defaultAppClient

        if (client.auth.hasRedirect()) {
            client.auth.handleRedirect().then(user => {
                console.log(`successfully logged in as redirected user with id: ${user.id}`)
                console.log(`profile: ${JSON.stringify(user.profile)}`)
            })
        }

        this.state = {
            value: "...loading",
            client: client
        }

        this.loginWithRedirect = this.loginWithRedirect.bind(this);
        this.loginWithCredential = this.loginWithCredential.bind(this);
        this.linkWithRedirect = this.linkWithRedirect.bind(this);
    }
    
    render() {
        return (
            <div className="centered">
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
            </div>
        );
    }
}

ReactDOM.render(
  <Hello compiler="JS" framework="React" />,
  document.getElementById("root")
);
