import { Storage, Transport } from "mongodb-stitch-core-sdk";

/** @hidden */
export class StitchAdminClientConfiguration {

    /**
     * The base URL of the Stitch server that the client will communicate with.
     */
    public readonly baseUrl?: string;
  
    /**
     * The underlying storage for persisting authentication and app state.
     */
    public readonly storage?: Storage;
  
    /**
     * The `Transport` that the client will use to make HTTP round trips to the Stitch server.
     */
    public readonly transport?: Transport;
  
    public constructor(
      baseUrl?: string,
      storage?: Storage,
      transport?: Transport
    ) {
      this.baseUrl = baseUrl;
      this.storage = storage;
      this.transport = transport;
    }
  
    public builder(): StitchAdminClientConfiguration.Builder {
      return new StitchAdminClientConfiguration.Builder(this);
    }
  }
  
  /* tslint:disable:no-namespace max-classes-per-file */
  /** @hidden */
  export namespace StitchAdminClientConfiguration {
    export class Builder {
      public baseUrl?: string;
      public storage?: Storage;
      public transport?: Transport;
  
      constructor(config?: StitchAdminClientConfiguration) {
        if (config) {
          this.baseUrl = config.baseUrl;
          this.storage = config.storage;
          this.transport = config.transport;
        }
      }
  
      public withBaseUrl(baseUrl: string): this {
        this.baseUrl = baseUrl;
        return this;
      }
  
      public withStorage(storage: Storage): this {
        this.storage = storage;
        return this;
      }
  
      public withTransport(transport: Transport): this {
        this.transport = transport;
        return this;
      }
  
      public build(): StitchAdminClientConfiguration {
        return new StitchAdminClientConfiguration(
          this.baseUrl,
          this.storage,
          this.transport
        );
      }
    }
  }
  