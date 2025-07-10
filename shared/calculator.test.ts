import { expect, test } from "vitest";
import { Calculator } from "./calculator";

test("simple calc test", () => {
   const sut = new Calculator();
   expect(sut.add(1, 2)).toBe(3);
});
