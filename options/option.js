'use strict';

const $C = require('collection.js');

const argv = require('../core/argv');

/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {?} [params.default]
 * @param {boolean | string} [params.env]
 * @param {string} [params.short]
 * @param {Array | Object} [params.values]
 * @param {boolean | Object | Array} [params.valuesFlags]
 */
function option(params) {
	const {name} = params;

	let value = params.default;

	if (params.values && typeof params.values === 'object') {
		$C(params.values).forEach((el, key, data) => {
			data[el] = el;
		});
	}

	if (params.env) {
		const envName = typeof params.env === 'string' ? params.env : name.toUpperCase().replace(/-/g, '_');

		if (envName in process.env) {
			value = process.env[envName];
		}
	}

	if (name in argv) {
		value = argv[name];

	} else if (params.short in argv) {
		value = argv[params.short];

	} else if (params.valuesFlags) {
		const
			va = params.valuesFlags,
			values = params.values;

		let arg;

		if (typeof va === 'boolean' && values) {
			arg = $C(Array.isArray(values) ? values : Object.keys(values)).one.get((el) => {
				return Boolean(argv[el]);
			});

		} else {
			arg = $C(Array.isArray(va) ? va : Object.keys(va)).one.get((el) => {
				return Boolean(argv[el]);
			});
		}

		if (arg) {
			value = arg;
		}
	}

	if (params.values && typeof params.values === 'object') {
		value = value in params.values ? params.values[value] : params.default;
	}

	return value;
}

module.exports = option;
