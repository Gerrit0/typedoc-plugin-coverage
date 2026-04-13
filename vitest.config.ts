import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["test/**/*.test.ts"],
		exclude: ["test/types/**/*.test.ts"],
		typecheck: {
			enabled: true,
			tsconfig: "tsconfig.json",
			include: ["test/types/**/*.test.ts"],
		},
	},
});
