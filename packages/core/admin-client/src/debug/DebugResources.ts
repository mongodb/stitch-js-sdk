import { EJSON } from 'bson';
import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import { BasicResource, checkEmpty } from "../Resources";
import { deserialize, json } from '../SerializeDecorator';

class Stats {
	@json("execution_time")
	public readonly executionTime: string
}

class ExecuteFunctionResult {
	@json("error_logs")
	public readonly errorLogs: any
	@json("logs")
	public readonly logs: any
	@json("result")
	public readonly result: any
	@json("stats", { prototype: Stats })
	public readonly stats: Stats
}
export class DebugResource extends BasicResource<ExecuteFunctionResult> {
  public executeFunction(userId: string, name: string, ...args): Promise<ExecuteFunctionResult> {
    const req = new StitchAuthRequest.Builder()
      .withMethod(Method.POST)
      .withPath(`${this.url}/execute_function?user_id=${userId}`)
      .withBody(JSON.stringify({name, "arguments": args}))
      .build();

    return this.adminAuth.doAuthenticatedRequest(req).then(response => {
      checkEmpty(response);
      return deserialize(EJSON.parse(response.body!), ExecuteFunctionResult);
    });
  }
}
