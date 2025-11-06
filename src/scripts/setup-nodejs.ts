import consola from 'consola';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import pc from 'picocolors';
import prompts from 'prompts';

import { detectPackageManager, installPackages } from '../utils/package-manager.js';
import { runInteractiveSetup } from './interactive-setup.js';

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

/**
 * Create basic tsconfig.json for Node.js project
 */
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

/**
 * Update package.json with Node.js specific configuration
 */
const updatePackageJson = (): void => {
	const cwd = process.cwd();
	const packageJsonPath = join(cwd, 'package.json');

	if (!existsSync(packageJsonPath)) {
		consola.error('❌ package.json not found!');
		process.exit(1);
	}

	const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

	// Add main entry
	if (!packageJson.main) {
		packageJson.main = './dist/main.js';
		consola.success('✓ Added main entry to package.json');
	} else {
		consola.warn('⚠️  main entry already exists, skipping');
	}

	// Add scripts
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

/**
 * Install TypeScript and Node.js development dependencies
 */
const installNodeDevDependencies = (pm: string): void => {
	const packages = ['typescript', 'ts-node-dev', 'tsconfig-paths', 'tsc-alias'];

	consola.info(`\n📦 Installing Node.js dev dependencies: ${pc.cyan(packages.join(', '))}\n`);

	installPackages(pm as any, packages, true);
	consola.success('✓ Installed TypeScript and Node.js dev dependencies\n');
};

/**
 * Main function to setup Node.js project
 */
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
		// Step 1: Create tsconfig.json
		consola.info('📝 Step 1/4: Creating tsconfig.json...');
		createTsConfig();

		// Step 2: Update package.json
		consola.info('\n📄 Step 2/4: Updating package.json...');
		updatePackageJson();

		// Step 3: Install dependencies
		consola.info('\n📦 Step 3/4: Installing dependencies...');
		installNodeDevDependencies(pm);

		// Step 4: Run interactive setup
		consola.box({
			title: '✨ Basic Setup Complete',
			message: [
				`${pc.green('✓')} TypeScript configuration created`,
				`${pc.green('✓')} Package.json updated`,
				`${pc.green('✓')} Dev dependencies installed`,
				'',
				`${pc.cyan('Next:')} Configure linting, formatting, and git hooks...`
			].join('\n'),
			style: {
				borderColor: 'blue',
				borderStyle: 'rounded',
				padding: 1
			}
		});

		const { continueSetup } = await prompts(
			{
				type: 'confirm',
				name: 'continueSetup',
				message: '🎨 Continue with interactive setup (ESLint, Prettier, Commitlint, Husky)?',
				initial: true
			},
			{
				onCancel: () => {
					consola.info('\n👋 Setup completed. You can run the setup later with: npx @jjuidev/node-devtools\n');
					process.exit(0);
				}
			}
		);

		if (continueSetup) {
			consola.info('\n🔧 Step 4/4: Running interactive setup...\n');
			await runInteractiveSetup();
		} else {
			consola.info('\n👋 Setup completed!\n');
		}
	} catch (error) {
		consola.error('❌ Setup failed');
		if (error instanceof Error) {
			consola.error(error.message);
		}
		process.exit(1);
	}
};
