import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";

enum Fields {
  USERNAME = "username",
  PASSWORD = "password"
}

export default class UserPasswordCredential implements StitchCredential {
  public readonly providerName: string;
  public readonly username: string;
  public readonly password: string;
  public providerType = ProviderTypes.USER_PASS;

  public readonly material: { [key: string]: string } = {
    [Fields.USERNAME]: this.username,
    [Fields.PASSWORD]: this.password
  };

  public readonly providerCapabilities = new ProviderCapabilities(false);

  public constructor(username: string, password: string, providerName: string = ProviderTypes.USER_PASS) {
    this.providerName = providerName;
    this.username = username;
    this.password = password;
  }
}
