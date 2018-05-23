import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import UserPasswordAuthProvider from "./UserPasswordAuthProvider";

enum Fields {
  USERNAME = "username",
  PASSWORD = "password"
}

export default class UserPasswordCredential implements StitchCredential {
  public readonly providerName: string;
  public readonly username: string;
  public readonly password: string;
  public providerType = UserPasswordAuthProvider.TYPE;

  public readonly material: { [key: string]: string } = {
    [Fields.USERNAME]: this.username,
    [Fields.PASSWORD]: this.password
  };

  public readonly providerCapabilities = new ProviderCapabilities(false);

  public constructor(username: string, password: string, providerName: string = UserPasswordAuthProvider.DEFAULT_NAME) {
    this.providerName = providerName;
    this.username = username;
    this.password = password;
  }
}
