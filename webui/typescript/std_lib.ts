/** Utility functions that should be in a standard library but isn't **/

export function array_sum(xs: Array<number>): number {
  return xs.reduce((acc, x) => acc + x, 0)
}

export function array_max(xs: Array<number>): number {
  return xs.reduce((acc, n) => (n > acc) ? n : acc, 0)
}

