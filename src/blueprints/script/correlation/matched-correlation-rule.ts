import { BlueprintCorrelation } from "../../models";

export interface MatchedCorrelationRule {
    rule: BlueprintCorrelation;
    paramName: string;
    paramValues: string[];
}