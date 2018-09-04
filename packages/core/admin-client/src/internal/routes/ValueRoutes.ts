import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import ValuesRoutes from "./ValuesRoutes";

export default class ValueRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(valuesRoutes: ValuesRoutes, valueId: string) {
        this.baseRoute = `${valuesRoutes.baseRoute}/${valueId}`
    }
}
