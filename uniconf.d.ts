declare module 'uniconf/options' {
	export const option: (name: string, params?: {
		default?: any,
		argv?: boolean | string,
		env?: string | boolean,
		short?: string,
		type: 'boolean' | 'number' | 'json',
		valuesFlags?: Array<string> | {[key: string]: any},
		coerce: (value: any, source: string) => any,
		validate: (value: any, source: string) => boolean
	}) => any;

	interface computedHandler {
		(config: any): any;
	}

	export const computed: <T extends computedHandler>(handler: T) => T;
}

declare module 'uniconf' {
	const config: {
		[key: string]: any;
	};

	export = config;
}
