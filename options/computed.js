'use strict';

const computedFlag = Symbol('computed');

function computed(handler) {
	handler[computedFlag] = true;
	return handler;
}

function isComputed(handler) {
	return (typeof handler === 'function' && handler[computedFlag]);
}

module.exports = {
	isComputed,
	computed
};
