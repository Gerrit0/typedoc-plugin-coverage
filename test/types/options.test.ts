import type { TypeDocOptions } from "typedoc";
import { describe, expectTypeOf, it } from "vitest";
import "../../index";

describe("Option Types", () => {
	it("should have correct types for coverage options", () => {
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageLabel");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageColor");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageSvgWidth");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageOutputPath");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageOutputType");
	});
});
