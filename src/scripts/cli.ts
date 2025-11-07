import { program } from 'commander';

import { runInteractiveSetup } from './interactive-setup.js';
import { setupNodejsProject } from './setup-nodejs.js';

program
	.name('node-devtools')
	.description('Interactive devtools (commitlint, eslint, prettier,...) setup for Node.js projects')
	.version('1.4.6');

// Default command - Interactive setup
program
	.command('setup', { isDefault: true })
	.description('Interactive setup - Install and configure all dev dependencies')
	.action(async () => {
		await runInteractiveSetup();
	});

// Node.js command - Quick Node.js project setup
program
	.command('nodejs')
	.description('Quick setup for TypeScript Node.js projects')
	.action(async () => {
		await setupNodejsProject();
	});

program.parse();
