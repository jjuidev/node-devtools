import { writeFileSync } from 'fs';
import { join } from 'path';

import consola from 'consola';

const GITIGNORE_CONTENT = `
# dependencies

node_modules

# package manager lockfiles
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
# bun.lockb

# production
build
dist

# misc
*.pem

# windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
Desktop.ini

# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# linux
*~
.directory
.Trash-*

# env files
.env*
!.env.example

# typescript
*.tsbuildinfo
`;

export const createGitignore = (): void => {
	const cwd = process.cwd();
	const gitignorePath = join(cwd, '.gitignore');

	try {
		writeFileSync(gitignorePath, GITIGNORE_CONTENT.trim() + '\n', 'utf8');
		consola.success('✓ Created/updated .gitignore file');
	} catch (error) {
		consola.error('❌ Failed to create .gitignore file');
		
		if (error instanceof Error) {
			consola.error(error.message);
		}
	}
};

