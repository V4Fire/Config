'use strict';

const {argv} = process;

function isFlag(str) {
	return /^--?[\S]+$/.test(str);
}

module.exports = argv.reduce((parsed, arg, i, argv) => {
	if (isFlag(arg)) {
		const next = argv[i + 1];

		let value;

		if (next && !isFlag(next)) {
			value = next;

		} else {
			value = !/^--no-/.test(arg);
		}

		parsed[arg.replace(/^--?(?:no-)?/, '')] = value;
	}

	return parsed;
}, {});
