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

/**
 * An AwsRequest encapsulates the details of an AWS request over the AWS 
 * service.
 */
export class AwsRequest {
  public constructor(
    public readonly service: string,
    public readonly action: string,
    public readonly region: string | undefined,
    public readonly args: object
  ) {}
}

export namespace AwsRequest {
  /**
   * A builder that can build an {@link AwsRequest}
   */
  export class Builder {
    private service: string;
    private action: string ;
    private region: string;
    private args: object;

    /**
     * Constructs a new builder for an AWS request.
     */
    public constructor() {}

    /**
     * Sets the AWS service that the action in the request will be performed 
     * against.
     *
     * @param service the AWS service that the action in the request will be 
     *                performed against.
     * @returns the builder.
     */
    public withService(service: string): this {
      this.service = service;
      return this;
    }

    /**
     * Sets the action within the AWS service to perform.
     *
     * @param action the action within the AWS service to perform.
     * @returns the builder.
     */
    public withAction(action: string): this {
      this.action = action;
      return this;
    }

    /**
     * Sets the region that service in this request should be scoped to.
     *
     * @param region the region that service in this request should be scoped to.
     * @returns the builder.
     */
    public withRegion(region: string): this {
      this.region = region;
      return this;
    }

    /**
     * Sets the arguments that will be used in the action.
     *
     * @param args the arguments that will be used in the action.
     * @returns the builder.
     */
    public withArgs(args: object): this {
      this.args = args;
      return this;
    }

    /**
     * Builds, validates, and returns the {@link AwsRequest}.
     *
     * @return the built AWS request.
     */
    public build(): AwsRequest {
      if(!this.service || this.service == "") {
        throw new Error("must set service");
      }

      if(!this.action || this.action == "") {
        throw new Error("must set action");
      }

      return new AwsRequest(
        this.service, 
        this.action, 
        this.region, 
        this.args || {}
      );
    }
  }
}