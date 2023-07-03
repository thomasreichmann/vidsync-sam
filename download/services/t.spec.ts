import { describe } from "mocha";
import TestClass from "./t";

describe("test esm problems", () => {
  it("should work", () => {
    console.log("test");
    const test = new TestClass();
    test.test("test");
  });
});
