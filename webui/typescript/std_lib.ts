/** Utility functions that should be in a standard library but isn't **/
import { Party } from "./types"

export function parties_equals(a: Array<Party>, b: Array<Party>): boolean {
  for (let i = 0; i < a.length; i++) {
    const c = a[i]
    const d = b[i]
    if (!c || !d) {
      return false
    }
    if (!(party_equals(c, d))) {
      return false
    }
  }
  return true
}

function party_equals(a: Party, b: Party): boolean {
  return a.num === a.num
    && a.grid_x === b.grid_x
    && a.grid_y === b.grid_y
    && a.x_pct === b.x_pct
    && a.y_pct === b.y_pct
    && a.color === b.color
}

export function array_sum(xs: Array<number>): number {
  return xs.reduce((acc, x) => acc + x, 0)
}

export function array_max(xs: Array<number>): number {
  return xs.reduce((acc, n) => (n > acc) ? n : acc, 0)
}
