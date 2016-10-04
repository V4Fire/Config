'use strict';

const
	path = require('path'),
	$C = require('collection.js');

const
	{ option } = require('./options'),
	{ isComputed } = require('./options/computed');

const nodeEnv = option({
	default: 'development',
	name: 'env',
	short: 'e',
	values: {
		prod: 'production',
		dev: 'development'
	},
	valuesFlags: true,
	env: 'NODE_ENV'
});

process.env.NODE_ENV = nodeEnv;

const
	configFolder = path.join(process.cwd(), 'config'),
	config = $C.extend(true,
		{},
		require(path.join(configFolder, 'default')),
		require(path.join(configFolder, nodeEnv))
	);

function setCacheableGetter(obj, key, getter) {
	Object.defineProperty(obj, key, {
		configurable: true,
		get: () => {
			const value = getter(config);
			Object.defineProperty(obj, key, {
				configurable: true,
				value
			});

			return value;
		}
	})
}

(function compute(obj) {
	$C(obj).forEach((el, key) => {
		if (isComputed(el)) {
			setCacheableGetter(obj, key, el);

		} else if (typeof el === 'object' && el) {
			compute(el);
		}
	});
})(config);

module.exports = config;
