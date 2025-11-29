/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
/* eslint-enable @typescript-eslint/no-require-imports */

module.exports = {
	plugins: {
		"@stylexswc/postcss-plugin": {
			include: [
				"src/app/**/*.{js,jsx,ts,tsx}",
				"src/components/**/*.{js,jsx,ts,tsx}",
			],
			useCSSLayers: true,
			rsOptions: {
				aliases: {
					"@/*": [path.join(__dirname, "src", "*")],
				},
				unstable_moduleResolution: {
					type: "commonJS",
				},
				dev: process.env.NODE_ENV === "development",
				treeshakeCompensation: true,
			},
		},
		autoprefixer: {},
	},
};
