import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import FunctionsRoutes from "./FunctionsRoutes";

export default class FunctionRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(functionsRoutes: FunctionsRoutes, functionId: string) {
        this.baseRoute = `${functionsRoutes.baseRoute}/${functionId}`
    }
}
