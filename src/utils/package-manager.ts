import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export const detectPackageManager = (): PackageManager => {
	const cwd = process.cwd();

	if (existsSync(join(cwd, 'bun.lockb'))) {
		return 'bun';
	}

	if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
		return 'pnpm';
	}

	if (existsSync(join(cwd, 'yarn.lock'))) {
		return 'yarn';
	}

	return 'npm';
};

export const getInstallCommand = (pm: PackageManager, packages: string[], dev: boolean = true): string => {
	const devFlag = dev ? (pm === 'npm' ? '--save-dev' : pm === 'yarn' ? '--dev' : '-D') : '';

	switch (pm) {
		case 'bun':
			return `bun add ${devFlag} ${packages.join(' ')}`;
		case 'pnpm':
			return `pnpm add ${devFlag} ${packages.join(' ')}`;
		case 'yarn':
			return `yarn add ${devFlag} ${packages.join(' ')}`;
		default:
			return `npm install ${devFlag} ${packages.join(' ')}`;
	}
};

export const installPackages = (pm: PackageManager, packages: string[], dev: boolean = true): void => {
	const command = getInstallCommand(pm, packages, dev);

	console.log(`\n📦 Running: ${command}\n`);

	try {
		execSync(command, {
			stdio: 'inherit',
			cwd: process.cwd(),
		});
	} catch (error: any) {
		console.error(`❌ Failed to install packages: ${error.message}`);
		throw error;
	}
};

export const isPackageInstalled = (packageName: string): boolean => {
	try {
		const cwd = process.cwd();
		const packageJsonPath = join(cwd, 'package.json');

		if (!existsSync(packageJsonPath)) {
			return false;
		}

		const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

		const allDeps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
			...packageJson.peerDependencies,
		};

		return !!allDeps[packageName];
	} catch {
		return false;
	}
};
