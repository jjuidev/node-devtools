import consola from 'consola';
import pc from 'picocolors';
import prompts from 'prompts';

import { setupCommitlint } from '../scripts/setup-commitlint.js';
import { SetupAnswers } from '../types/setup.js';
import { getPackagesToInstall } from '../utils/package-lists.js';
import { detectPackageManager, installPackages } from '../utils/package-manager.js';
import { initHusky } from './init-husky.js';
import { setupEslint } from './setup-eslint.js';
import { setupTypescriptAlias } from './setup-typescript-alias.js';

export const runInteractiveSetup = async (): Promise<void> => {
	consola.box({
		title: '🛠️  Node DevTools Setup',
		message: 'Interactive configuration for your development environment',
		style: {
			borderColor: 'cyan',
			borderStyle: 'rounded'
		}
	});

	consola.info("Let's configure your development tools!\n");

	const answers = await prompts(
		[
			{
				type: 'select',
				name: 'framework',
				message: '🚀 Which framework do you use?',
				choices: [
					{ title: '📦 Node.js', value: 'node' },
					{ title: '⚛️  React', value: 'react' },
					{ title: '📱 React Native', value: 'react-native' },
					{ title: '▲  Next.js', value: 'next' }
				],
				initial: 0
			},
			{
				type: (prev, values) => (values.framework === 'react' || values.framework === 'next' ? 'confirm' : null),
				name: 'useTailwind',
				message: '🎨 Are you using Tailwind CSS?',
				initial: false
			},
			{
				type: (prev, values) => (values.framework === 'react' || values.framework === 'next' ? 'confirm' : null),
				name: 'useStorybook',
				message: '📚 Are you using Storybook?',
				initial: false
			},
			{
				type: 'confirm',
				name: 'useTypescriptAlias',
				message: '📂 Do you want to use TypeScript alias imports?',
				initial: false
			}
		],
		{
			onCancel: () => {
				consola.warn('\nSetup cancelled by user');
				process.exit(0);
			}
		}
	);

	const setupAnswers: SetupAnswers = {
		framework: answers.framework || 'node',
		useTailwind: answers.useTailwind || false,
		useStorybook: answers.useStorybook || false,
		useTypescriptAlias: answers.useTypescriptAlias || false
	};

	const frameworkLabels = {
		node: '📦 Node.js',
		react: '⚛️  React',
		'react-native': '📱 React Native',
		next: '▲  Next.js'
	};

	const summaryLines = [`🚀 Framework: ${pc.cyan(frameworkLabels[setupAnswers.framework])}`];

	if (
		setupAnswers.framework === 'react' ||
		setupAnswers.framework === 'react-native' ||
		setupAnswers.framework === 'next'
	) {
		summaryLines.push(`🎨 Tailwind CSS: ${setupAnswers.useTailwind ? pc.green('✓ Yes') : pc.gray('✗ No')}`);
		summaryLines.push(`📚 Storybook: ${setupAnswers.useStorybook ? pc.green('✓ Yes') : pc.gray('✗ No')}`);
	}

	summaryLines.push(`📂 TypeScript Alias: ${setupAnswers.useTypescriptAlias ? pc.green('✓ Yes') : pc.gray('✗ No')}`);

	consola.box({
		title: '📋 Configuration Summary',
		message: summaryLines.join('\n'),
		style: {
			borderColor: 'blue',
			borderStyle: 'rounded',
			padding: 1
		}
	});

	const packages = getPackagesToInstall(setupAnswers);

	consola.info(`\n📦 ${pc.cyan(`${packages.length} packages`)} will be installed:\n`);

	const gitHookPackages = ['husky', 'lint-staged'];
	const commitlintPackages = ['@commitlint/cli', '@commitlint/config-conventional'];
	const eslintAndPrettierPackages = [
		'eslint',
		'prettier',
		'globals',
		'@eslint/js',
		'typescript-eslint',
		'eslint-config-prettier',
		'eslint-plugin-autofix',
		'eslint-plugin-import',
		'eslint-plugin-prefer-arrow-functions',
		'eslint-plugin-react',
		'eslint-plugin-react-hooks',
		'eslint-plugin-react-native',
		'@next/eslint-plugin-next',
		'eslint-plugin-tailwindcss',
		'prettier-plugin-tailwindcss',
		'eslint-plugin-storybook'
	];

	const installedGitHookPackages = packages.filter((p) => gitHookPackages.includes(p));
	const installedCommitlint = packages.filter((p) => commitlintPackages.includes(p));
	const installedEslintPrettier = packages.filter((p) => eslintAndPrettierPackages.includes(p));

	if (installedGitHookPackages.length > 0) {
		consola.info(pc.bold('  🪝 Git Hook Packages:'));
		installedGitHookPackages.forEach((pkg) => console.log(`     ${pc.green('•')} ${pc.white(pkg)}`));
	}

	if (installedCommitlint.length > 0) {
		consola.info(pc.bold('\n  📝 Commitlint Packages:'));
		installedCommitlint.forEach((pkg) => console.log(`     ${pc.yellow('•')} ${pc.white(pkg)}`));
	}

	if (installedEslintPrettier.length > 0) {
		consola.info(pc.bold('\n  🎨 ESLint & Prettier Packages:'));
		installedEslintPrettier.forEach((pkg) => console.log(`     ${pc.cyan('•')} ${pc.white(pkg)}`));
	}

	console.log('');

	const { confirmInstall } = await prompts({
		type: 'confirm',
		name: 'confirmInstall',
		message: '✨ Proceed with installation?',
		initial: true
	});

	if (!confirmInstall) {
		consola.warn('Installation cancelled');
		return;
	}

	const pm = detectPackageManager();
	const pmIcons: Record<string, string> = {
		npm: '📦',
		yarn: '🧶',
		pnpm: '📌',
		bun: '🥟'
	};

	consola.start(`${pmIcons[pm] || '📦'} Detected package manager: ${pc.cyan(pm)}`);

	try {
		installPackages(pm, packages, true);
		consola.success('All packages installed successfully!\n');

		setupCommitlint();
		setupEslint(setupAnswers);
		initHusky();

		if (setupAnswers.useTypescriptAlias) {
			setupTypescriptAlias();
		}

		consola.box({
			title: '✨ Setup Complete',
			message: [
				`${pc.green('✓')} All development tools have been configured!`,
				'',
				`${pc.cyan('What was set up:')}`,
				`  📦 ${pc.bold('Packages')} - All dependencies installed`,
				`  📝 ${pc.bold('Commitlint')} - Commit message validation`,
				`  🔍 ${pc.bold('ESLint')} - Code linting`,
				`  💅 ${pc.bold('Prettier')} - Code formatting`,
				`  🪝 ${pc.bold('Husky')} - Git hooks`,
				'',
				`${pc.cyan('Next steps:')}`,
				`  ${pc.gray('1.')} Start coding in your project`,
				`  ${pc.gray('2.')} Commit with: ${pc.green('git commit -m "feat: your feature"')}`,
				`  ${pc.gray('3.')} Hooks will automatically validate and format your code`,
				'',
				`${pc.gray('Example:')} ${pc.green('git commit -m "feat: add awesome feature"')}`
			].join('\n'),
			style: {
				borderColor: 'green',
				borderStyle: 'rounded',
				padding: 1
			}
		});
	} catch (error) {
		consola.error('Failed to install packages');
		if (error instanceof Error) {
			consola.error(error.message);
		}
		process.exit(1);
	}
};
