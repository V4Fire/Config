declare module 'uniconf/options' {
	export const option: (params?: {
		name?: string,
		default?: any,
		env?: string | boolean,
		short?: string,
		values?: Array<any> | {[key: string]: any},
		valuesFlags?: boolean | Array<string>
	}) => any;

	export const computed: <T extends Function>(handler: T) => T;
}

declare module 'uniconf' {
	const config: {
		[key: string]: any;
	};

	export = config;
}
