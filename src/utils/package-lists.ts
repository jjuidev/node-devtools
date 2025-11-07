import { PackageToInstall, SetupAnswers } from '../types/setup.js';

export const BASE_PACKAGES: PackageToInstall[] = [
	// pkgs common to husky and lint-staged
	{
		name: 'husky',
		dev: true,
	},
	{
		name: 'lint-staged',
		dev: true,
	},

	// pkgs common to commitlint
	{
		name: '@commitlint/cli',
		dev: true,
	},
	{
		name: '@commitlint/config-conventional',
		dev: true,
	},

	// pkgs common to eslint and prettier
	{
		name: 'prettier',
		dev: true,
	},
	{
		name: 'eslint',
		dev: true,
	},
	{
		name: '@eslint/js',
		dev: true,
	},
	{
		name: 'globals',
		dev: true,
	},
	{
		name: 'typescript-eslint',
		dev: true,
	},
];

export const ESLINT_BASE_PACKAGES: PackageToInstall[] = [
	{
		name: 'eslint-config-prettier',
		dev: true,
	},
	{
		name: 'eslint-plugin-autofix',
		dev: true,
	},
	{
		name: 'eslint-plugin-import',
		dev: true,
	},
	{
		name: 'eslint-plugin-prefer-arrow-functions',
		dev: true,
	},
];

export const PRETTIER_BASE_PACKAGES: PackageToInstall[] = [];
export const CONDITIONAL_PACKAGES: PackageToInstall[] = [
	{
		name: ['eslint-plugin-react', 'eslint-plugin-react-hooks', 'eslint-plugin-react-native'],
		dev: true,
		condition: (answers: SetupAnswers) =>
			answers.framework === 'react' || answers.framework === 'next' || answers.framework === 'react-native',
	},
	{
		name: '@next/eslint-plugin-next',
		dev: true,
		condition: (answers: SetupAnswers) => answers.framework === 'next',
	},
	{
		name: ['eslint-plugin-tailwindcss', 'prettier-plugin-tailwindcss'],
		dev: true,
		condition: (answers: SetupAnswers) => answers.useTailwind,
	},
	{
		name: 'eslint-plugin-storybook',
		dev: true,
		condition: (answers: SetupAnswers) => answers.useStorybook,
	},
];

export const getPackagesToInstall = (answers: SetupAnswers): string[] => {
	const packages: string[] = [];

	BASE_PACKAGES.forEach((pkg) => {
		const names = Array.isArray(pkg.name) ? pkg.name : [pkg.name];

		packages.push(...names);
	});

	ESLINT_BASE_PACKAGES.forEach((pkg) => {
		const names = Array.isArray(pkg.name) ? pkg.name : [pkg.name];

		packages.push(...names);
	});

	PRETTIER_BASE_PACKAGES.forEach((pkg) => {
		const names = Array.isArray(pkg.name) ? pkg.name : [pkg.name];

		packages.push(...names);
	});

	CONDITIONAL_PACKAGES.forEach((pkg) => {
		if (pkg.condition && pkg.condition(answers)) {
			const names = Array.isArray(pkg.name) ? pkg.name : [pkg.name];

			packages.push(...names);
		}
	});

	return packages;
};
