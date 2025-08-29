/**
 * @type {import('lint-staged').Configuration}
 */

const settings = {
	"src/**/*": [() => "tsc", "eslint --fix", "prettier --write"],
	"styles/**/*": ["stylelint --fix", "prettier --write"],
	"tsconfig.json|pnpm-lock.yaml": [() => "tsc", "prettier --write"],
	"eslint.config.mjs": [() => "eslint", () => "prettier --check ."],
	"stylelint.config.mjs": [() => "stylelint .", () => "prettier --check ."],
	"prettier.config.mjs": [() => "prettier --check ."],
};
settings[`!(${Object.keys(settings).join("|")})`] = [
	"prettier --write --ignore-unknown",
];

export default settings;
