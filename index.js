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

(function compute(obj) {
	$C(obj).forEach((el, key) => {
		if (isComputed(el)) {
			obj[key] = el(config);

		} else if (typeof el === 'object' && el) {
			compute(el);
		}
	});
})(config);

module.exports = config;
