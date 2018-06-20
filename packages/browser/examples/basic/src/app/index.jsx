import * as React from "react";
import * as ReactDOM from "react-dom";
import { 
    Stitch, 
    StitchAppClientConfiguration, 
    UserPasswordAuthProviderClient, 
    MemoryStorage, 
    AnonymousCredential
} from "mongodb-stitch-browser-sdk";

class Hello extends React.Component {
    callSomeFunction(client) {
        client.callFunction("echoArg", [42]).then(result => {
            this.setState({
                value: result["arg"]
            })
        }).catch(err => {
            console.log(err)
        });
    }

    constructor(props) {
        super(props);

        let client = Stitch.initializeDefaultAppClient("test-js-sdk-ikwas");
        client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
            console.log(`successfully logged in as anonymous user with id: ${user.id}`)
            console.log(`profile: ${JSON.stringify(user.profile)}`)
            this.callSomeFunction(client)
        }).catch(err => {
            console.log(err)
        })

        let userPassClient = client.auth.getProviderClient(UserPasswordAuthProviderClient.factory)

        console.log(userPassClient);

        this.state = {
            value: "...loading"
        }
    }
    
    render() {
        return (
            <div>
                <div>{this.props.compiler}</div>
                <div>{this.props.framework}</div>
                <div>{this.state.value}</div>
            </div>
        );
    }
}

ReactDOM.render(
  <Hello compiler="JS" framework="React" />,
  document.getElementById("root")
);
