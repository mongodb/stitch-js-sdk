import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";
import ValueRoutes from "./ValueRoutes";

export default class ValuesRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/values`
    }

    public getValueRoutes(valueId: string) {
        return new ValueRoutes(this, valueId);
    }
}
