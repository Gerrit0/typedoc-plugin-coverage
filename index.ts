import { writeFileSync } from "fs";
import { join } from "path";
import {
	Application,
	DeclarationReflection,
	ReflectionKind,
	Renderer,
	RendererEvent,
} from "typedoc";

declare module "typedoc" {
	export interface TypeDocOptionMap {
		coverageColor: string;
	}
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="104" height="20">
  <script/>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect rx="3" width="104" height="20" fill="#555"/>
  <rect rx="3" x="64" width="40" height="20" fill="@color@"/>
  <path fill="@color@" d="M64 0h4v20h-4z"/>
  <rect rx="3" width="104" height="20" fill="url(#a)"/>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="32" y="15" fill="#010101" fill-opacity=".3">document</text>
    <text x="32" y="14">document</text>
    <text x="84" y="15" fill="#010101" fill-opacity=".3">@ratio@</text>
    <text x="84" y="14">@ratio@</text>
  </g>
</svg>
`.trim();

export function load(app: Application) {
	app.options.addDeclaration({
		name: "coverageColor",
		help: "Define the define the color of the coverage badge background. Defaults to a dynamic color depending on coverage percentage.",
		defaultValue: "",
	});

	app.renderer.on(Renderer.EVENT_END, (event: RendererEvent) => {
		let actualCount = 0;
		let expectedCount = 0;

		let kinds = app.options
			.getValue("requiredToBeDocumented")
			.reduce((acc, kindName) => acc | ReflectionKind[kindName], 0);

		if (kinds & ReflectionKind.FunctionOrMethod) {
			kinds |= ReflectionKind.CallSignature;
		}
		if (kinds & ReflectionKind.Constructor) {
			kinds |= ReflectionKind.ConstructorSignature;
		}

		for (const refl of Object.values(event.project.reflections)) {
			if (
				refl instanceof DeclarationReflection &&
				refl.getAllSignatures().length
			) {
				// Comment will be on the signatures, which we'll get later in this loop.
				continue;
			}

			if (refl.kindOf(kinds)) {
				expectedCount += 1;

				if (refl.hasComment()) {
					actualCount += 1;
				}
			}
		}

		const percentDocumented = expectedCount
			? Math.floor((100 * actualCount) / expectedCount)
			: 0;

		let color = app.options.getValue("coverageColor");
		if (!color) {
			if (percentDocumented < 50) {
				color = "#db654f";
			} else if (percentDocumented < 90) {
				color = "#dab226";
			} else {
				color = "#4fc921";
			}
		}

		const badge = svg
			.replace(/@ratio@/g, `${percentDocumented.toFixed(1)}%`)
			.replace(/@color@/g, color);
		writeFileSync(join(event.outputDirectory, "coverage.svg"), badge);
	});
}
