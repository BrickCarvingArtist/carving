require("babel-register")({
	presets: [
		"latest",
		"stage-0"
	],
	plugins: [
		"transform-runtime"
	]
});
require("./app");