import { Party, Rgb } from "./types"

export function grid_x_to_pct(grid_x: number): number {
  return (grid_x + 1) / 2
}

export function grid_y_to_pct(grid_y: number): number {
  return -1 * ((grid_y + 1) / 2 - 1)
}

export function parse_color(color_str: string): Rgb {
  //  0123456
  // '#fae213'
  const r = parseInt(color_str.slice(1, 3), 16)
  const g = parseInt(color_str.slice(3, 5), 16)
  const b = parseInt(color_str.slice(5), 16)
  return { r, g, b }
}

export function parties_from_table(): Array<Element> {
  const table = document.getElementById('party-table')!
  const tbody = table.children[0]!
  return Array.from(tbody.children)
}

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
