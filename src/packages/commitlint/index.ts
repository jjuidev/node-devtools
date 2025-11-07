export type CommitEmoji = {
	type: string;
	code: string;
	emoji: string;
	description: string;
};

const createCommitlintConfigRecommend = (commitlintEmoji: CommitEmoji[]) => {
	return {
		// https://commitlint.js.org/#/reference-configuration
		extends: ['@commitlint/config-conventional'],
		rules: {
			'type-enum': [2, 'always', commitlintEmoji.map((item) => item.type)],
			'type-case': [2, 'always', 'lower-case'],
			'type-empty': [2, 'never'],

			'subject-case': [2, 'never'],
			'subject-empty': [2, 'never'],
			'subject-min-length': [2, 'always', 10],
			'subject-max-length': [2, 'always', 120],
		},

		// https://github.com/folke/devmoji
		types: commitlintEmoji.map((item) => item.type),
		devmoji: commitlintEmoji.map(({ code, emoji, description }) => ({
			code,
			emoji,
			description,
		})),
	};
};

const COMMITLINT_EMOJI_RECOMMEND = [
	{
		type: 'init',
		code: ':init:',
		emoji: ':tada:',
		description: 'Initialize project',
	},
	{
		type: 'feat',
		code: ':feat:',
		emoji: ':sparkles:',
		description: 'Add new feature',
	},
	{
		type: 'fix',
		code: ':fix:',
		emoji: ':bug:',
		description: 'Fix a bug',
	},
	{
		type: 'chore',
		code: ':chore:',
		emoji: ':wrench:',
		description: 'Minor tasks or maintenance',
	},
	{
		type: 'docs',
		code: ':docs:',
		emoji: ':memo:',
		description: 'Update documentation',
	},
	{
		type: 'style',
		code: ':style:',
		emoji: ':lipstick:',
		description: 'Improve UI or code style',
	},
	{
		type: 'improve',
		code: ':improve:',
		emoji: ':rocket:',
		description: 'Improve code quality or performance or readability or maintainability or etc',
	},
	{
		type: 'refactor',
		code: ':refactor:',
		emoji: ':recycle:',
		description: 'Refactor code without changing logic',
	},
	{
		type: 'perf',
		code: ':perf:',
		emoji: ':zap:',
		description: 'Enhance performance',
	},
	{
		type: 'test',
		code: ':test:',
		emoji: ':white_check_mark:',
		description: 'Add or update tests',
	},
	{
		type: 'build',
		code: ':build:',
		emoji: ':building_construction:',
		description: 'Changes related to the build system',
	},
	{
		type: 'ci',
		code: ':ci:',
		emoji: ':repeat:',
		description: 'Configure CI/CD',
	},
	{
		type: 'revert',
		code: ':revert:',
		emoji: ':rewind:',
		description: 'Revert a previous commit',
	},
	{
		type: 'merge',
		code: ':merge:',
		emoji: ':twisted_rightwards_arrows:',
		description: 'Merge branches',
	},
	{
		type: 'wip',
		code: ':wip:',
		emoji: ':construction:',
		description: 'Work in progress',
	},
	{
		type: 'release',
		code: ':release:',
		emoji: ':rocket:',
		description: 'Release a new version',
	},
	{
		type: 'upgrade',
		code: ':upgrade:',
		emoji: ':arrow_up:',
		description: 'Upgrade dependencies or software',
	},
	{
		type: 'downgrade',
		code: ':downgrade:',
		emoji: ':arrow_down:',
		description: 'Downgrade dependencies or software',
	},
	{
		type: 'bump',
		code: ':bump:',
		emoji: ':package:',
		description: 'Bump package version',
	},
	{
		type: 'security',
		code: ':security:',
		emoji: ':lock:',
		description: 'Improve security',
	},
	{
		type: 'hotfix',
		code: ':hotfix:',
		emoji: ':fire:',
		description: 'Urgent bug fix',
	},
	{
		type: 'maintainer',
		code: ':maintainer:',
		emoji: ':crown:',
		description: 'Maintainer commit and excellent handle for system',
	},
];

export const commitlintConfigRecommend = createCommitlintConfigRecommend(COMMITLINT_EMOJI_RECOMMEND);
export type CommitlintConfig = ReturnType<typeof createCommitlintConfigRecommend>;

export const defineCommitlintConfig = (configFn?: (emojiList: CommitEmoji[]) => CommitEmoji[]): CommitlintConfig => {
	if (!configFn) {
		return commitlintConfigRecommend;
	}

	const emojiList = configFn(COMMITLINT_EMOJI_RECOMMEND);

	return createCommitlintConfigRecommend(emojiList);
};
