import { suite, test } from "@testdeck/mocha";
import { assert } from "chai";
import { BlueprintTimeUnit } from "../../models";
import { Parameters } from "./parameter.util";

@suite
export class ParameterUtilTests {

  @test
  testGetDate() {
    const date = new Date();
    date.setMonth(2);
    date.setDate(12);
    date.setFullYear(2023);

    const offsetDate = Parameters.getOffsetDate(date, { amount: -953, unit: BlueprintTimeUnit.days });
    assert.equal(offsetDate.getMonth(), 7);
    assert.equal(offsetDate.getDate(), 1);
    assert.equal(offsetDate.getFullYear(), 2020);
  }

}