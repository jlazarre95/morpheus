import { suite, test } from "@testdeck/mocha";
import { replaceAll } from "./string.util";
import { assert } from "chai";

@suite
export class StringUtilTests {

  @test
  testReplaceAll() {
    const result = replaceAll('Neo is The One. Welcome to the Matrix, Neo.', 'Neo', 'P_FirstName');
    assert.equal('P_FirstName is The One. Welcome to the Matrix, P_FirstName.', result);
  }

  @test
  testReplaceAllIgnoreCase() {
    const result = replaceAll('Neo is The One. Welcome to the Matrix, Neo.', 'neO', 'P_FirstName', { ignoreCase: true });
    assert.equal('P_FirstName is The One. Welcome to the Matrix, P_FirstName.', result);
  }

  @test
  testDoNotReplaceAll() {
    const result = replaceAll('Neo is The One. Welcome to the Matrix, Neo.', 'neO', 'P_FirstName');
    assert.equal('Neo is The One. Welcome to the Matrix, Neo.', result);
  }

  @test
  testReplaceAllRegex() {
    const result = replaceAll('Neo and Trinity are The One. Welcome to the Matrix, Neo and Trinity.', '(Neo|Trinity)', 'P_FirstName', { regex: true });
    assert.equal('P_FirstName and P_FirstName are The One. Welcome to the Matrix, P_FirstName and P_FirstName.', result);
  }

  @test
  testReplaceAllRegexIgnoreCase() {
    const result = replaceAll('Neo and Trinity are The One. Welcome to the Matrix, Neo and Trinity.', '(neO|tRinITY)', 'P_FirstName', { regex: true, ignoreCase: true });
    assert.equal('P_FirstName and P_FirstName are The One. Welcome to the Matrix, P_FirstName and P_FirstName.', result);
  }

  @test
  testDoNotReplaceAllRegex() {
    const result = replaceAll('Neo and Trinity are The One. Welcome to the Matrix, Neo and Trinity.', '(neO|Tr.+?y)', 'P_FirstName', { regex: true });
    assert.equal('Neo and P_FirstName are The One. Welcome to the Matrix, Neo and P_FirstName.', result);
  }

}