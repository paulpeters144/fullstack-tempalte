import { Calculator } from "@shared/calculator";
import { expect, test } from "vitest";

test("simple calc test", () => {
   const sut = new Calculator();
   expect(sut.add(1, 2)).toBe(3);
});
