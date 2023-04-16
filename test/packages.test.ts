import * as ts from "typescript";
import { join } from "path";
import { Application, TSConfigReader, TypeDocOptions } from "typedoc";
import { it, expect, describe } from "vitest";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { load } from "../index.js";

const app = new Application();
app.options.addReader(new TSConfigReader());
app.bootstrap({
	tsconfig: join(__dirname, "packages", "tsconfig.json"),
	excludeExternals: true,
	logLevel: "None",
});
load(app);

const program = ts.createProgram(
	app.options.getFileNames(),
	app.options.getCompilerOptions()
);

async function expectCoverage(
	ratio: number,
	folder: string,
	options: Partial<TypeDocOptions> = {}
) {
	const sf = program.getSourceFile(
		join(__dirname, "packages", folder, "index.ts")
	);
	expect(sf).toBeDefined();

	const tmp = await mkdtemp(join(tmpdir(), "typedoc-plugin-coverage-"));

	const saved = Object.fromEntries(
		Object.keys(options).map((key) => [key, app.options.getValue(key)])
	);

	try {
		for (const [key, val] of Object.entries(options)) {
			app.options.setValue(key, val);
		}
		const project = app.converter.convert([
			{
				displayName: folder,
				program,
				sourceFile: sf!,
			},
		]);

		await app.renderer.render(project, tmp);

		const badge = await readFile(join(tmp, "coverage.svg"), "utf-8");
		const actualCoverage = badge.match(
			/<text x="84" y="14">([^<]+)<\/text>/
		)?.[1];

		expect(actualCoverage).toBe(`${Math.floor(ratio * 100)}%`);
	} finally {
		for (const [key, val] of Object.entries(saved)) {
			app.options.setValue(key, val);
		}

		await rm(tmp, { recursive: true, force: true });
	}
}

describe("Plugin", () => {
	it("Handles empty documentation", async () => {
		await expectCoverage(0, "no-members");
	});

	it("Handles function documentation", async () => {
		// By default, requiredToBeDocumented only covers functions
		await expectCoverage(2 / 3, "functions");
	});

	it("Respects requiredToBeDocumented", async () => {
		// But we could make it stricter
		await expectCoverage(4 / 5, "functions", {
			requiredToBeDocumented: ["Function", "Project", "Parameter"],
		});

		// Or less strict
		await expectCoverage(1 / 1, "functions", {
			requiredToBeDocumented: ["Project"],
		});
	});
});
