/**
 * Documented:
 * 1 project (index.ts)
 * 1 alias (Ctor)
 * 1 parameter (x)
 *
 * Not documented:
 * 1 signature (foo)
 *
 * @module
 */

/**
 * Ctor doc
 * @param x x doc
 */
export type Ctor = new(x: string) => object;

export function foo() {}
