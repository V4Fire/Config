'use strict';

const argv = require('../core/argv');

/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {boolean|string} [params.env]
 * @param {string} [params.short]
 */
function option(params) {
	const {name} = params;

	let value = params.default;

	if (params.env) {
		const envName = typeof params.env === 'string' ? params.env : name.toUpperCase().replace(/-/g, '_');

		if (envName in process.env) {
			value = process.env[envName];
		}
	}

	if (name in argv) {
		value = argv[name];
	}

	if (params.short in argv) {
		value = argv[params.short];
	}

	if (params.variantsArgv) {

	}

	return value;
}
