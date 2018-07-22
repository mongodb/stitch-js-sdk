import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import RuleRoutes from "./RuleRoutes";
import ServiceRoutes from "./ServiceRoutes";

export default class RulesRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(serviceRoutes: ServiceRoutes) {
        this.baseRoute = `${serviceRoutes.baseRoute}/rules`
    }

    public getRuleRoutes(ruleId: string) {
        return new RuleRoutes(this, ruleId);
    }
}
