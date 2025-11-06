export type Framework = 'node' | 'react' | 'react-native' | 'next';

export interface SetupAnswers {
	framework: Framework;
	useTailwind: boolean;
	useStorybook: boolean;
	useTypescriptAlias: boolean;
}

export interface PackageToInstall {
	name: string | string[];
	dev: boolean;
	condition?: (answers: SetupAnswers) => boolean;
}
