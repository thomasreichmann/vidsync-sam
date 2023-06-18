"use strict";

import { expect } from "chai";
import { lambdaHandler } from "../../app.mjs";
var event, context;

describe("Tests index", function () {
  it("verifies successful response", () => {
    lambdaHandler(event, context).then((result) => {
      expect(result).to.be.an("object");
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an("string");

      console.log(response);

      let response = JSON.parse(result.body);

      expect(response).to.be.an("object");
      expect(response.times).to.be.an("object");

      expect(response.times).to.have.property("total upload");
      expect(response.times).to.have.property("total resize");
      expect(response.times).to.have.property("download time");
    });
  });
});
