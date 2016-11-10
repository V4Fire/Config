module.exports = {
	boolean: {
		coerce: (val) => !(!val || /^false$/i.test(val)) // regex checking useful for values like "True"
	},

	number: {
		coerce(val) {
			const coercedVal = Number(val);
			return Number.isFinite(coercedVal) ? coercedVal : val;
		},

		validate: Number.isFinite
	},

	json: {
		coerce: JSON.parse
	}
};
