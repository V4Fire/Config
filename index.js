'use strict';

const
	path = require('path'),
	Sugar = require('sugar'),
	$C = require('collection.js');

const
	{ option } = require('./options'),
	{ isComputed } = require('./options/computed');

const nodeEnv = option('env', {
	default: 'development',
	short: 'e',
	validate: ['development', 'production'],
	valuesFlags: {
		prod: 'production',
		dev: 'development'
	},
	env: 'NODE_ENV'
});

process.env.NODE_ENV = nodeEnv;

const configFolder = path.join(process.cwd(), 'config');

let config, envConfig;

try {
	config = require(path.join(configFolder, 'default'));

} catch (err) {
	throw new Error(`Uniconf can't require default config, got error: ${err}`);
}

try {
	envConfig = require(path.join(configFolder, nodeEnv));

} catch (err) {
	console.log(`Uniconf can't require ${nodeEnv} config, got error: ${err}`);
}

$C.extend(true, config, envConfig);

function setCacheableGetter(obj, key, getter) {
	Object.defineProperty(obj, key, {
		configurable: true,
		get() {
			const value = getter(config);
			Object.defineProperty(obj, key, {
				configurable: true,
				value
			});

			return value;
		}
	});
}

(function compute(obj) {
	$C(obj).forEach((el, key) => {
		if (isComputed(el)) {
			setCacheableGetter(obj, key, el);

		} else if (Sugar.Object.isObject(el)) {
			compute(el);
		}
	});
})(config);

module.exports = config;
