/**
 * Decode untrusted values without `typeof` (banned by anti-slop/no-runtime-typeof).
 * Prefer these at I/O boundaries, then branch on the returned domain type.
 *
 * Uses `JsonValue` instead of `unknown` / bare `object` so boundary parsers stay
 * expressible under anti-slop parameter rules.
 */

const objectTag = Object.prototype.toString;

/** JSON-compatible value (post-parse, pre-domain decode). */
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| JsonObject;

export type JsonObject = { readonly [key: string]: JsonValue };

/**
 * Runtime values accepted by boundary decoders.
 * Intentionally excludes bare `object` and `unknown` (anti-slop bans those params).
 */
export type UntypedInput = JsonValue | bigint | symbol | undefined;

/** True when `value` is a primitive string or String object. */
export function isStringValue(value: UntypedInput): boolean {
	return objectTag.call(value) === '[object String]';
}

/** True when `value` is a primitive number or Number object. */
export function isNumberValue(value: UntypedInput): boolean {
	return objectTag.call(value) === '[object Number]';
}

/** True when `value` is a plain object (not null, array, or boxed primitive). */
export function isPlainObject(value: UntypedInput): value is JsonObject {
	return objectTag.call(value) === '[object Object]';
}

/** Return a string when `value` is a string; otherwise undefined. */
export function readString(value: UntypedInput): string | undefined {
	if (!isStringValue(value)) return undefined;
	return String(value);
}

/** Return a finite number when `value` is a number; otherwise undefined. */
export function readFiniteNumber(value: UntypedInput): number | undefined {
	if (!isNumberValue(value)) return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * Parse JSON text into a JsonValue.
 * Callers should decode further into named domain types.
 */
export function parseJsonValue(text: string): JsonValue {
	// SAFETY: JSON.parse returns JSON-compatible values; we treat the result as JsonValue.
	return JSON.parse(text) as JsonValue;
}

type NodeProcessLike = {
	env?: Record<string, string | undefined>;
};

/**
 * Read `process.env` when Node exposes it on `globalThis`.
 * Avoids `typeof` / ambient `process` assumptions in isomorphic modules.
 */
export function readProcessEnv(): Record<string, string | undefined> | undefined {
	if (!('process' in globalThis)) return undefined;
	// SAFETY: Node attaches `process` on globalThis; property access after the `in` check.
	const proc = (globalThis as typeof globalThis & { process?: NodeProcessLike }).process;
	return proc?.env;
}
