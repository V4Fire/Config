'use strict';

const
	$C = require('collection.js'),
	joi = require('joi'),
	Sugar = require('sugar');

const cliArgv = require('../core/argv');

const
	paramsSchema = joi.object().keys({
		default: joi.any().default(null),
		argv: joi.alternatives().try(joi.string().min(1), joi.boolean()).default(true),
		env: joi.alternatives().try(joi.string().min(1), joi.boolean()).default(false),
		short: joi
			.string()
			.min(1)
			.max(1)
			.regex(/^[a-z]$/i, 'short flag name')
			.default(null)
	});

/**
 *
 * @param {string} name
 * @param {Object} [params]
 * @param {?} [params.default]
 * @param {boolean | string} [params.argv = true]
 * @param {boolean | string} [params.env = false]
 * @param {string} [params.short]
 * @param {Array | Object} [params.values]
 * @param {boolean | Object | Array} [params.valuesFlags]
 */
function option(name, params = {}) {
	if (!name || typeof name !== 'string') {
		throw new TypeError(`Parameter "name" expected string, got ${name} (${typeof name})`);
	}

	const {argv, env, short} = joi.validate(params, paramsSchema);

	let value = params.default;

	if (env) {
		const envName = Sugar.Object.isString(env) ? env : name.toUpperCase().replace(/-/g, '_');

		if (envName in process.env) {
			value = process.env[envName];
		}
	}

	if (argv) {
		const argvName = Sugar.Object.isString(argv) ? argv : name;

		if (argvName in cliArgv) {
			value = cliArgv[argvName];
		}
	}

	if (short && (short in cliArgv)) {
		value = cliArgv[short];
	}

	return value;
}

module.exports = option;
