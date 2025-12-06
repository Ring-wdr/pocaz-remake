import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs";
import StylexPlugin from "@stylexswc/webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],
	framework: "@storybook/nextjs",
	staticDirs: ["../public"],

	// StyleX Webpack 플러그인 연동
	webpackFinal: async (config) => {
		config.plugins = config.plugins || [];
		config.plugins.push(
			new StylexPlugin({
				rsOptions: {
					aliases: {
						"@/*": [path.join(__dirname, "..", "src", "*")],
					},
				},
				stylexImports: ["stylex", "@stylexjs/stylex"],
			}),
		);

		return config;
	},

	typescript: {
		reactDocgen: "react-docgen-typescript",
	},
};

export default config;
