import type { TypeDocOptions } from "typedoc";
import { describe, it } from "vitest";
import "../index.ts";

// vitest has this built in, but it is trivial to re-implement in a way which
// doesn't kick out an ugly warning when running tests and doesn't require pinning
// the vitest version.
function expectTypeOf<T>() {
	return {
		toHaveProperty(prop: keyof T) {},
	};
}

describe("Option Types", () => {
	it("should have correct types for coverage options", () => {
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageLabel");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageColor");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageSvgWidth");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageOutputPath");
		expectTypeOf<TypeDocOptions>().toHaveProperty("coverageOutputType");
	});
});
