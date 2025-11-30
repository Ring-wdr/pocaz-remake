import path from "node:path";
import stylexPlugin from "@stylexswc/nextjs-plugin/turbopack";

export default stylexPlugin({
	rsOptions: {
		aliases: {
			"@/*": [path.join(__dirname, "src", "*")],
		},
		unstable_moduleResolution: {
			type: "commonJS",
		},
		runtimeInjection: false,
		treeshakeCompensation: true,
	},
	stylexImports: ["stylex", "@stylexjs/stylex"],
})({
	reactCompiler: true,
	transpilePackages: ["@stylexjs/open-props"],
	experimental: {
		authInterrupts: true,
	},
});
