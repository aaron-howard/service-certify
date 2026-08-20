const tag = Object.prototype.toString;

/** Return a string when `value` is a string; otherwise null. */
export function readString(value) {
	if (tag.call(value) !== '[object String]') return null;
	return String(value);
}
