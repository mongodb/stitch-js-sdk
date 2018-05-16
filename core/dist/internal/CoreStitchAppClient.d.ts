import StitchAuthRequestClient from "../auth/internal/StitchAuthRequestClient";
import { StitchAppRoutes } from "../internal/net/StitchAppRoutes";
export default class CoreStitchAppClient {
    private readonly authRequestClient;
    private readonly routes;
    constructor(authRequestClient: StitchAuthRequestClient, routes: StitchAppRoutes);
    callFunctionInternal<T>(name: string, ...args: any[]): Promise<T>;
    private getCallFunctionRequest(name, ...args);
}
