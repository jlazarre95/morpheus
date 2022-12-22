import { suite, test } from "@testdeck/mocha";
import { assert } from "chai";
import { getRange } from "../../util";
import { BlueprintRequestResponseFilter, BlueprintRequestResponseFilterTarget } from "../models";
import { Har, HarPostData, HarRequest, HarResponse, HarResponseContent } from "./har";
import { RequestResponseFilter } from "./request-response-filter";

@suite
export class RequestResponseFilterTests {

  private request: HarRequest;
  private response: HarResponse;
  private actions: string[];
  private occurrences: Map<BlueprintRequestResponseFilter, number>;

  before() {
    this.request = new HarRequest();
    this.request.method = 'GET';
    this.request.url = 'https://www.welcometothematrix.com';
    this.request.headers = [ 
      { name: 'The One', value: 'Neo' },
      { name: 'The Love Interest', value: 'Trinity' },
      { name: 'The Agent', value: 'Agent Smith' },
    ];
    this.request.postData = new HarPostData();
    this.request.postData.text = 'You can either take the blue pill or the red pill.';

    this.response = new HarResponse();
    this.response.status = 200;
    this.response.headers = [ 
      { name: 'Name', value: 'Thomas Anderson' },
      { name: 'Alias', value: 'Neo' },
    ];
    this.response.content = new HarResponseContent();
    this.response.content.text = 'Red pill';

    this.actions = ['Alice in Wonderland', 'Rabbit Hole'];
    this.occurrences = new Map<BlueprintRequestResponseFilter, number>();
  }

  @test
  testMatchWithoutFilters() {
    const filter: BlueprintRequestResponseFilter = {};
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: ['Alice in Wonderland', 'Rabbit Hole'] });
    assert.equal(result, true);
  }

  @test
  testMatchIncludeAndExcludeFilters() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      method: [
        { method: 'GET' },
        { method: 'POST' },
      ],
      url: {
        url: 'google.com',
        regex: true,
        exclude: true
      },
      status: [
        getRange(200),
      ],
      headers: {
        headers: 'Interest: Trin'
      },
      body: {
        body: 'take the blue pill',
      },
      action: {
        action: "(Alicia.+Blunderland|Bunny)",
        regex: true,
        exclude: true
      },
      occurrences: [
        getRange(6)
      ]
    };
    this.occurrences.set(filter, 5);
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, true);
  }

  @test
  testMatchAllIncludeFilters() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      method: [
        { method: 'GET' },
        { method: 'POST' },
      ],
      url: {
        url: 'welcome(.+?)thematrix.com',
        regex: true
      },
      status: [
        getRange(200),
      ],
      headers: {
        headers: 'Interest: Trin'
      },
      body: {
        body: 'take the blue pill',
      },
      action: {
        action: "(Alice.+Wonderland|Rabbit)",
        regex: true,
      },
      occurrences: [
        getRange(6)
      ]
    };
    this.occurrences.set(filter, 5);
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, true);
  }

  @test
  testMatchAllExcludeFilters() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      method: [
        { method: 'POST', exclude: true },
      ],
      url: {
        url: 'google.com',
        regex: true,
        exclude: true
      },
      status: [
        getRange(400, true),
      ],
      headers: {
        headers: 'Test: test',
        exclude: true
      },
      body: {
        body: 'take the yellow pill',
        exclude: true
      },
      action: {
        action: "(Alicia.+Blunderland|Bunny)",
        regex: true,
        exclude: true
      },
      occurrences: [
        getRange(10, true)
      ]
    };
    this.occurrences.set(filter, 5);
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, true);
  }

  @test
  testDoNotMatchExcludeMethodFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      method: [
        { method: 'GET', exclude: true },
      ]
    };
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

  @test
  testDoNotMatchExcludeUrlFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      url: {
        url: 'welcome(.+?)thematrix.com',
        regex: true,
        exclude: true
      },
    };
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

  @test
  testDoNotMatchExcludeStatusFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      status: [
        getRange(200, true),
      ],
    };
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

  @test
  testDoNotMatchExcludeHeadersFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      headers: {
        headers: 'Interest: Trin',
        exclude: true
      },
    };
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

  @test
  testDoNotMatchExcludeBodyFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      body: {
        body: 'take the blue pill',
        exclude: true
      },
    };
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

  @test
  testDoNotMatchExcludeActionFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      action: {
        action: "(Alice.+Wonderland|Rabbit)",
        regex: true,
        exclude: true
      },
    };
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

  @test
  testDoNotMatchExcludeOccurrencesFilter() {
    const filter: BlueprintRequestResponseFilter = {
      target: BlueprintRequestResponseFilterTarget.request,
      occurrences: [
        getRange(6, true)
      ]
    };
    this.occurrences.set(filter, 5);
    const result = RequestResponseFilter.match(this.request, this.response, filter, { actions: this.actions, occurrences: this.occurrences });
    assert.equal(result, false);
  }

} 