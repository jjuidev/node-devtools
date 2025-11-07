import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import consola from 'consola';
import pc from 'picocolors';

export const initHusky = (): void => {
	consola.start('Initializing Husky...');

	try {
		execSync('npx husky init', { stdio: 'inherit' });
	} catch (error: any) {
		consola.warn('Husky init command failed, creating .husky manually');
	}

	const huskyDir = join(process.cwd(), '.husky');

	if (!existsSync(huskyDir)) {
		mkdirSync(huskyDir, { recursive: true });
	}

	const hooks = [
		{
			name: 'prepare-commit-msg',
			content: `#!/bin/sh
npx devmoji --edit --lint --config ./.commitlintrc.cjs
`,
			emoji: '📝',
			description: 'Add emoji to commit messages',
		},
		{
			name: 'commit-msg',
			content: `#!/bin/sh
npx --no -- commitlint --edit $1
`,
			emoji: '✅',
			description: 'Validate commit messages',
		},
		{
			name: 'pre-commit',
			content: `#!/bin/sh
npx lint-staged
`,
			emoji: '🚀',
			description: 'Run linters on staged files',
		},
	];

	consola.start('Creating git hooks...\n');

	hooks.forEach(({ name, content, emoji, description }) => {
		const hookPath = join(huskyDir, name);

		writeFileSync(hookPath, content, { mode: 0o755 });
		consola.success(`${emoji} ${pc.bold(name)} - ${pc.gray(description)}`);
	});

	consola.success('Husky initialized with git hooks\n');
};
