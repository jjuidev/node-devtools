import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import consola from 'consola';
import pc from 'picocolors';

import { SetupAnswers } from '../types/setup.js';

const PRETTIER_BASE_CONFIG = {
	useTabs: true,
	tabWidth: 2,
	printWidth: 120,
	semi: true,
	singleQuote: true,
	jsxSingleQuote: false,
	arrowParens: 'always',
	trailingComma: 'all',
	endOfLine: 'auto',
	plugins: [] as string[],
};

interface EslintImports {
	imports: string[];
	plugins: string[];
}

const getEslintImports = (answers: SetupAnswers): EslintImports => {
	const imports = ['defineEslintConfig', 'eslintConfigNode'];
	const plugins: string[] = [];

	switch (answers.framework) {
		case 'react':
			imports.push('pluginReact');
			plugins.push('pluginReact()');
			break;

		case 'react-native':
			// imports.push('pluginReactNative');
			// plugins.push('pluginReactNative()');
			break;

		case 'next':
			imports.push('pluginNext');
			plugins.push('pluginNext()');
			break;

		default:
			break;
	}

	if (answers.useStorybook) {
		imports.push('pluginStorybook');
		plugins.push('pluginStorybook()');
	}

	return {
		imports,
		plugins,
	};
};

const getEslintTemplate = (imports: string[], plugins: string[]): string => {
	const importLine = `import { ${imports.join(', ')} } from '@jjuidev/node-devtools';`;

	const configArgs = ['eslintConfigNode', ...plugins].join(', ');

	return `${importLine}

const eslintConfig = defineEslintConfig(${configArgs});

export default eslintConfig;
`;
};

export const setupEslint = (answers: SetupAnswers): void => {
	consola.start('Setting up ESLint and Prettier...');

	const prettierConfig = { ...PRETTIER_BASE_CONFIG };

	if (answers.useTailwind) {
		prettierConfig.plugins.push('prettier-plugin-tailwindcss');
	}

	const prettierrcPath = join(process.cwd(), '.prettierrc.json');

	if (existsSync(prettierrcPath)) {
		consola.info('Overwriting existing .prettierrc.json');
	}

	writeFileSync(prettierrcPath, JSON.stringify(prettierConfig, null, '\t') + '\n', 'utf8');
	consola.success(`Created ${pc.cyan('.prettierrc.json')}`);

	const { imports, plugins } = getEslintImports(answers);
	const eslintTemplate = getEslintTemplate(imports, plugins);

	const eslintConfigPath = join(process.cwd(), 'eslint.config.mjs');

	if (existsSync(eslintConfigPath)) {
		consola.info('Overwriting existing eslint.config.mjs');
	}

	writeFileSync(eslintConfigPath, eslintTemplate, 'utf8');
	consola.success(`Created ${pc.cyan('eslint.config.mjs')}`);

	const packageJsonPath = join(process.cwd(), 'package.json');

	if (existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

			if (!packageJson.scripts) {
				packageJson.scripts = {};
			}

			packageJson.scripts.format =
				'eslint --fix "src/**/*.{js,ts,jsx,tsx}" && prettier --write "src/**/*.{js,ts,jsx,tsx}"';

			if (!packageJson['lint-staged']) {
				packageJson['lint-staged'] = {};
			}

			packageJson['lint-staged']['*.{js,ts,jsx,tsx}'] = ['eslint --fix', 'prettier --write'];
			packageJson['lint-staged']['package.json'] = ['npx prettier-package-json --write'];

			writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf8');
			consola.success('Updated package.json with scripts and lint-staged config');
		} catch (error) {
			consola.warn('Could not update package.json');
		}
	}

	consola.success('ESLint and Prettier configured\n');
};
