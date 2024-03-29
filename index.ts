import { writeFileSync } from "fs";
import { join } from "path";
import {
	Application,
	DeclarationReflection,
	ParameterType,
	Reflection,
	ReflectionKind,
	ReflectionType,
	Renderer,
	RendererEvent,
} from "typedoc";

declare module "typedoc" {
	export interface TypeDocOptionMap {
		coverageLabel: string;
		coverageColor: string;
		coverageOutputPath: string;
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
    <text x="32" y="15" fill="#010101" fill-opacity=".3">@label@</text>
    <text x="32" y="14">@label@</text>
    <text x="84" y="15" fill="#010101" fill-opacity=".3">@ratio@</text>
    <text x="84" y="14">@ratio@</text>
  </g>
</svg>
`.trim();

export function load(app: Application) {
	app.options.addDeclaration({
		name: "coverageLabel",
		help: "Define the label for the coverage badge. Defaults to 'document'.",
		defaultValue: "document",
	});

	app.options.addDeclaration({
		name: "coverageColor",
		help: "Define the define the color of the coverage badge background. Defaults to a dynamic color depending on coverage percentage.",
		defaultValue: "",
	});

	app.options.addDeclaration({
		name: "coverageOutputPath",
		help: "Defines the path where the coverage badge will be written, defaults to <output directory>/coverage.svg.",
		type: ParameterType.Path,
	});

	app.renderer.on(Renderer.EVENT_END, (event: RendererEvent) => {
		let actualCount = 0;
		let expectedCount = 0;

		let kinds = app.options
			.getValue("requiredToBeDocumented")
			.reduce((acc, kindName) => acc | ReflectionKind[kindName], 0);

		// This code is basically a copy/paste of TypeDoc 0.25.7's validateDocumentation function
		// https://github.com/TypeStrong/typedoc/blob/master/src/lib/validation/documentation.ts
		// where we record numbers checked rather than giving warnings.
		if (kinds & ReflectionKind.FunctionOrMethod) {
			kinds |= ReflectionKind.CallSignature;
			kinds = kinds & ~ReflectionKind.FunctionOrMethod;
		}
		if (kinds & ReflectionKind.Constructor) {
			kinds |= ReflectionKind.ConstructorSignature;
			kinds = kinds & ~ReflectionKind.Constructor;
		}
		if (kinds & ReflectionKind.Accessor) {
			kinds |= ReflectionKind.GetSignature | ReflectionKind.SetSignature;
			kinds = kinds & ~ReflectionKind.Accessor;
		}

		const toProcess = event.project.getReflectionsByKind(kinds);
		const seen = new Set<Reflection>();

		outer: while (toProcess.length) {
			const ref = toProcess.shift()!;
			if (seen.has(ref)) continue;
			seen.add(ref);

			// If we're a non-parameter inside a parameter, we shouldn't care. Parameters don't get deeply documented
			let r: Reflection | undefined = ref.parent;
			while (r) {
				if (r.kindOf(ReflectionKind.Parameter)) {
					continue outer;
				}
				r = r.parent;
			}

			// Type aliases own their comments, even if they're function-likes.
			// So if we're a type literal owned by a type alias, don't do anything.
			if (
				ref.kindOf(ReflectionKind.TypeLiteral) &&
				ref.parent?.kindOf(ReflectionKind.TypeAlias)
			) {
				toProcess.push(ref.parent);
				continue;
			}
			// Ditto for signatures on type aliases.
			if (
				ref.kindOf(ReflectionKind.CallSignature) &&
				ref.parent?.parent?.kindOf(ReflectionKind.TypeAlias)
			) {
				toProcess.push(ref.parent.parent);
				continue;
			}

			if (ref instanceof DeclarationReflection) {
				const signatures =
					ref.type instanceof ReflectionType
						? ref.type.declaration.getNonIndexSignatures()
						: ref.getNonIndexSignatures();

				if (signatures.length) {
					// We've been asked to validate this reflection, so we should validate that
					// signatures all have comments, but we'll still have a comment here because
					// type aliases always have their own comment.
					toProcess.push(...signatures);
				}
			}

			const symbolId = event.project.getSymbolIdFromReflection(ref);

			// Diverging from validateDocumentation here.
			if (!symbolId || symbolId.fileName.includes("node_modules")) continue;

			++expectedCount;
			if (ref.hasComment()) {
				++actualCount;
			}
		}

		const percentDocumented = expectedCount
			? Math.floor((100 * actualCount) / expectedCount)
			: 0;

		let label = app.options.getValue("coverageLabel");
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
			.replace(/@ratio@/g, `${percentDocumented}%`)
			.replace(/@color@/g, color)
			.replace(/@label@/g, label);
		const outFile =
			app.options.getValue("coverageOutputPath") ||
			join(event.outputDirectory, "coverage.svg");
		writeFileSync(outFile, badge);
	});
}
