import {
  UserPasswordAuthProvider,
  UserPasswordCredential
} from "../../../../lib";

describe("UserPasswordCredentialUnitTests", () => {
  it("should test credential", () => {
    const username = "username@10gen.com";
    const password = "password";

    const credential = new UserPasswordCredential(username, password);

    expect(UserPasswordAuthProvider.DEFAULT_NAME).toEqual(
      credential.providerName
    );
    expect(username).toEqual(credential.material.username);
    expect(password).toEqual(credential.material.password);
    expect(false).toEqual(
      credential.providerCapabilities.reusesExistingSession
    );

    const credentialWithProv = new UserPasswordCredential(
      username,
      password,
      "hello"
    );

    expect("hello").toEqual(credentialWithProv.providerName);
    expect(username).toEqual(credentialWithProv.material.username);
    expect(password).toEqual(credentialWithProv.material.password);
    expect(false).toEqual(
      credentialWithProv.providerCapabilities.reusesExistingSession
    );
  });
});
