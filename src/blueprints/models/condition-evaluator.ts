import { isDefined } from "class-validator";
import { BlueprintSimulationCondition, SimulationConditionName } from ".";
import { ElementFinder } from "../simulation/element-finder";

export class ConditionEvaluator {

    constructor(private elementFinder: ElementFinder) {

    }

    async evalCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        const name: SimulationConditionName | undefined = BlueprintSimulationCondition.getName(condition);
        if(!isDefined(name)) {
            return Promise.resolve(false);
        }
        switch(name) {
            case SimulationConditionName.selector:
                return await this.evalSelectorCondition(condition);
            case SimulationConditionName.waitFor:
                return await this.evalWaitForCondition(condition);
            case SimulationConditionName.not:
                return await this.evalNotCondition(condition);
            case SimulationConditionName.or:
                return await this.evalOrCondition(condition);
            case SimulationConditionName.and:
                return await this.evalAndCondition(condition);
            case SimulationConditionName.xor:
                return await this.evalXorCondition(condition);
            default:
                throw new Error(`Unsupported condition: ${name}`);
        }
    }


    private async evalSelectorCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        return !!await this.elementFinder.find(condition.selector!.selector, condition.selector!.root, true);
    }

    private async evalWaitForCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        return !!await this.elementFinder.waitFor(condition.waitFor!.selector.selector, condition.waitFor!.selector.root, condition.waitFor!.options, true);
    }

    private async evalNotCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        return !await this.evalCondition(condition.not!);
    }

    private async evalOrCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        for(const cond of condition.or!) {
            if(await this.evalCondition(cond)) {
                return true;
            }
        }
        return false;
    }

    private async evalAndCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        for(const cond of condition.and!) {
            if(!await this.evalCondition(cond)) {
                return false;
            }
        }
        return true;
    }

    private async evalXorCondition(condition: BlueprintSimulationCondition): Promise<boolean> {
        let xor: boolean = false;
        for(const cond of condition.xor!) {
            if(await this.evalCondition(cond) && xor) {
                return false;
            }
            xor = true;
        }
        return xor;
    }   

}