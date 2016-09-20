'use strict';

const
	path = require('path'),
	$C = require('$C');

const { option } = require('./options');

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

const configFolder = path.join(process.cwd(), 'config');

module.exports = $C.extend(true,
	{},
	require(path.join(configFolder, 'default')),
	require(path.join(configFolder, nodeEnv))
);