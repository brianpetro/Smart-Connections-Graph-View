import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";


const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === "production");

const copy_to_plugins = {
	name: 'copy_to_plugins',
	setup(build) {
		build.onEnd(() => {
			const plugin_path = path.join(process.env.OBSIDIAN_PLUGINS_PATH, "smart-connections-visualizer");
			
			if (!fs.existsSync(plugin_path)) {
				fs.mkdirSync(plugin_path);
			}
			
			fs.copyFileSync("./main.js", path.join(plugin_path, "main.js"));
			fs.copyFileSync("./manifest.json", path.join(plugin_path, "manifest.json"));
			fs.copyFileSync("./styles.css", path.join(plugin_path, "styles.css"));
			// add empty .hotreload file
			fs.writeFileSync(path.join(plugin_path, ".hotreload"), "");
			
			console.log("Plugin built and copied to obsidian plugins folder");
		});
	}
};
const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: "inline",
	treeShaking: true,
	outfile: "main.js",
	plugins: [
		copy_to_plugins
	]
});
if(!prod) await context.watch();
else {
	await context.rebuild();
	process.exit(0);
}

