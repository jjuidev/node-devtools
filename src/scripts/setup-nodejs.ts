import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import consola from 'consola';
import pc from 'picocolors';

import { executeSetup } from './interactive-setup.js';
import { SetupAnswers } from '../types/setup.js';
import { createGitignore } from '../utils/create-gitignore.js';
import { detectPackageManager, installPackages } from '../utils/package-manager.js';

interface TsConfig {
	compilerOptions: {
		module: string;
		target: string;
		moduleResolution: string;
		outDir: string;
		esModuleInterop: boolean;
		strictNullChecks: boolean;
	};
	include: string[];
}

interface PackageJson {
	[key: string]: any;
}

const createTsConfig = (): void => {
	const cwd = process.cwd();
	const tsconfigPath = join(cwd, 'tsconfig.json');

	if (existsSync(tsconfigPath)) {
		consola.warn('⚠️  tsconfig.json already exists, skipping creation');
		return;
	}

	const tsconfig: TsConfig = {
		compilerOptions: {
			module: 'NodeNext',
			target: 'ESNext',
			moduleResolution: 'NodeNext',
			outDir: 'dist',
			esModuleInterop: true,
			strictNullChecks: true
		},
		include: ['src/**/*']
	};

	writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, '\t'), 'utf8');
	consola.success('✓ Created tsconfig.json');
};

const updatePackageJson = (): void => {
	const cwd = process.cwd();
	const packageJsonPath = join(cwd, 'package.json');

	if (!existsSync(packageJsonPath)) {
		consola.error('❌ package.json not found!');
		process.exit(1);
	}

	const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

	packageJson.main = './dist/main.js';

	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}

	const scriptsToAdd: Record<string, string> = {
		build: 'tsc && tsc-alias',
		dev: 'tsnd --respawn --cls --rs -r tsconfig-paths/register ./src/main.ts',
		start: 'node .'
	};

	let scriptsAdded = false;

	for (const [name, command] of Object.entries(scriptsToAdd)) {
		if (!packageJson.scripts[name]) {
			packageJson.scripts[name] = command;
			scriptsAdded = true;
		}
	}

	if (scriptsAdded) {
		writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t'), 'utf8');
		consola.success('✓ Added scripts to package.json');
	} else {
		consola.warn('⚠️  All scripts already exist, skipping');
	}
};

const installNodeDevDependencies = (pm: string): void => {
	const packages = ['typescript', 'ts-node-dev', 'tsconfig-paths', 'tsc-alias'];

	consola.info(`\n📦 Installing Node.js dev dependencies: ${pc.cyan(packages.join(', '))}\n`);

	installPackages(pm as any, packages, true);
	consola.success('✓ Installed TypeScript and Node.js dev dependencies\n');
};

export const setupNodejsProject = async (): Promise<void> => {
	consola.box({
		title: '🚀 Node.js Project Setup',
		message: 'Quick setup for TypeScript Node.js projects',
		style: {
			borderColor: 'green',
			borderStyle: 'rounded'
		}
	});

	const pm = detectPackageManager();

	const pmIcons: Record<string, string> = {
		npm: '📦',
		yarn: '🧶',
		pnpm: '📌',
		bun: '🥟'
	};

	consola.start(`${pmIcons[pm] || '📦'} Detected package manager: ${pc.cyan(pm)}\n`);

	try {
		consola.info('📝 Step 1/5: Creating .gitignore...');
		createGitignore();

		consola.info('\n📝 Step 2/5: Creating tsconfig.json...');
		createTsConfig();

		consola.info('\n📄 Step 3/5: Updating package.json...');
		updatePackageJson();

		consola.info('\n📦 Step 4/5: Installing dependencies...');
		installNodeDevDependencies(pm);

		consola.box({
			title: '✨ Basic Setup Complete',
			message: [
				`${pc.green('✓')} .gitignore file created`,
				`${pc.green('✓')} TypeScript configuration created`,
				`${pc.green('✓')} Package.json updated`,
				`${pc.green('✓')} Dev dependencies installed`,
				'',
				`${pc.cyan('Next:')} Configuring linting, formatting, and git hooks...`
			].join('\n'),
			style: {
				borderColor: 'blue',
				borderStyle: 'rounded',
				padding: 1
			}
		});

		const setupAnswers: SetupAnswers = {
			framework: 'node',
			useTailwind: false,
			useStorybook: false,
			useTypescriptAlias: false,
			useGitignore: false
		};

		consola.info('\n🔧 Step 5/5: Running devtools setup (Node.js + TypeScript alias)...\n');
		await executeSetup(setupAnswers);
	} catch (error) {
		consola.error('❌ Setup failed');

		if (error instanceof Error) {
			consola.error(error.message);
		}

		process.exit(1);
	}
};
