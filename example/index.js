const stitch = require("stitch-web")

const callSomeFunction = (client) => {
    client.callFunction("echoArg", 42).then(result => {
        console.log(result)
    }).catch(err => {
        console.log(err)
    })
    client.callFunction("echoArg", { hello: "world" }).then(result => {
        console.log(result)
    }).catch(err => {
        console.log(err)
    })

    client.callFunction("echoArg", { hello: "world" }, 42, 42).then(result => {
        console.log(result)
    }).catch(err => {
        console.log(err)
    })
}

const doSomeEmailPassStuff = (client) => {

}

stitch.Stitch.initialize()

let config = stitch.StitchAppClientConfiguration.Builder
                .forApp("stitch-tests-js-sdk-jntlj")
                .withStorage(new stitch.MemoryStorage())

stitch.Stitch.initializeDefaultAppClient(config);

let client = stitch.Stitch.defaultAppClient

client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user => {
    console.log(`successfully logged in as anonymous user with id: ${user.id}`)
    console.log(`profile: ${JSON.stringify(user.profile)}`)
    callSomeFunction(client)
}).catch(err => {
    console.log(err)
})

let userPassClient = client.auth.getProviderClient(stitch.UserPasswordAuthProviderClient.Factory)

console.log(userPassClient)
