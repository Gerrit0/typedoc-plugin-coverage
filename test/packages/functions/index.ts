/**
 * Documented:
 * 1 project (index.ts)
 * 2 signatures (bar, bar(x))
 * 1 parameter (x)
 *
 * Not documented:
 * 1 signature (foo)
 *
 * @module
 */

export function foo() {}

/** Documented */
export function bar();
/**
 * Documented
 * @param x documented parameter
 */
export function bar(x: string);
export function bar(x?: string) {}
