import { program } from 'commander';

import { runInteractiveSetup } from './interactive-setup.js';

program
	.name('node-devtools')
	.description('Interactive devtools (commitlint, eslint, prettier,...) setup for Node.js projects')
	.version('1.3.0');

program.description('Interactive setup - Install and configure all dev dependencies').action(async () => {
	await runInteractiveSetup();
});

program.parse();
