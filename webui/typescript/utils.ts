import { cache, set_cache } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { load_parties } from "./load_parties"
import { parse_result } from "./plot/plot_simulation"
import { Canvas, Party } from "./types"

export function grid_x_to_pct(grid_x: number): number {
  return (grid_x + 1) / 2
}

export function grid_y_to_pct(grid_y: number): number {
  return -1 * ((grid_y + 1) / 2 - 1)
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

export function array_sum(xs: Array<number>): number {
  return xs.reduce((acc, x) => acc + x, 0)
}

export function replot(simulation_canvas: Canvas) {
  const parties = load_parties()
  if (cache && parties_equals(cache.parties, parties)) {
    const new_cache = cache.cache.map(parse_result)
    set_cache({ cache: new_cache, parties })
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, new_cache.map(p => p.color))
  }
}

