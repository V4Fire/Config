'use strict';

const
	$C = require('collection.js'),
	joi = require('joi'),
	Sugar = require('sugar');

const
	cliArgv = require('../core/argv'),
	bultInTypes = require('../core/types');

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
			.default(null),

		type: joi.valid(['boolean', 'number', 'json']),

		valuesFlags: joi.alternatives(joi.array().items(joi.string()), joi.object()),

		coerce: joi.func(),

		validate: joi.alternatives(joi.func(), joi.object().type(RegExp), joi.array())
	});

/**
 *
 * @param {string} name
 * @param {Object} [params = {}]
 * @param {?} [params.default]
 * @param {boolean | string} [params.argv = true]
 * @param {boolean | string} [params.env = false]
 * @param {string} [params.short]
 * @param {string} [params.type]
 * @param {Array | Object} [params.values]
 * @param {Object | Array} [params.valuesFlags]
 * @param {Function} [params.coerce]
 * @param {RegExp | Array | Function} [params.validate]
 */
function option(name, params = {}) {
	if (!name || typeof name !== 'string') {
		throw new TypeError(`Parameter "name" expected string, got ${name} (${typeof name})`);
	}

	const validation = joi.validate(params, paramsSchema);

	if (validation.error) {
		throw validation.error;
	}

	params = validation.value;

	if (params.type) {
		$C.extend({deep: false, traits: true}, params, bultInTypes[params.type]);
	}

	const {argv, env, short, valuesFlags, coerce = (v) => v} = params;

	let validate = () => true;

	if (Sugar.Object.isRegExp(params.validate)) {
		validate = (v) => params.validate.test(v);
	}

	if (Array.isArray(params.validate)) {
		validate = (v) => params.validate.indexOf(v) !== -1;
	}

	if (Sugar.Object.isFunction(params.validate)) {
		validate = params.validate;
	}

	let
		source = null,
		value = params.default;

	if (params.default !== null) {
		source = 'default';
	}

	if (env) {
		const envName = Sugar.Object.isString(env) ? env : name.toUpperCase().replace(/-/g, '_');

		if (envName in process.env) {
			value = process.env[envName];

			source = 'env';
		}
	}

	if (argv) {
		const argvName = Sugar.Object.isString(argv) ? argv : name;

		if (argvName in cliArgv) {
			value = cliArgv[argvName];

			source = 'cli';
		}
	}

	if (short && (short in cliArgv)) {
		value = cliArgv[short];

		source = 'cli';
	}

	if (valuesFlags) {
		if (Array.isArray(valuesFlags)) {
			const val = $C(valuesFlags).one.get((el) => el in cliArgv);

			if (val !== null) {
				value = val;
			}

		} else {
			const val = $C(valuesFlags).one.get((el, key) => key in cliArgv);

			if (val !== null) {
				value = val;
			}
		}
	}

	if (value !== null) {
		value = coerce(value, source);

		if (!validate(value, source)) {
			throw new Error(`Invalid value "${value}" for option "${name}"`);
		}
	}

	return value;
}

module.exports = option;
