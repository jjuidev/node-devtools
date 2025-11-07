import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import consola from 'consola';
import pc from 'picocolors';

export const setupTypescriptAlias = () => {
	consola.start('Setting up TypeScript alias imports...');

	const tsconfigPath = join(process.cwd(), 'tsconfig.json');

	if (!existsSync(tsconfigPath)) {
		consola.warn('tsconfig.json not found. Skipping TypeScript alias setup.');
		return;
	}

	try {
		const tsconfigContent = readFileSync(tsconfigPath, 'utf8');
		const tsconfig = JSON.parse(tsconfigContent);

		// Initialize compilerOptions if it doesn't exist
		if (!tsconfig.compilerOptions) {
			tsconfig.compilerOptions = {};
		}

		// Add or update baseUrl and paths
		tsconfig.compilerOptions.baseUrl = 'src';
		tsconfig.compilerOptions.paths = {
			'@/*': ['./*'],
		};

		// Write back to file with proper formatting
		writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, '\t'), 'utf8');

		consola.success(`Updated ${pc.cyan('tsconfig.json')} with alias imports:\n`);
		consola.info(`  ${pc.gray('•')} baseUrl: ${pc.green('"src"')}`);
		consola.info(`  ${pc.gray('•')} paths: ${pc.green('{ "@/*": ["./*"] }')}\n`);
	} catch (error) {
		consola.error('Failed to update tsconfig.json');

		if (error instanceof Error) {
			consola.error(error.message);
		}
	}
};
