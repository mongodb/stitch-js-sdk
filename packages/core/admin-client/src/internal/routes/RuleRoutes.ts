import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import RulesRoutes from "./RulesRoutes";

export default class RuleRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(rulesRoutes: RulesRoutes, ruleId: string) {
        this.baseRoute = `${rulesRoutes.baseRoute}/${ruleId}`
    }
}
