import { cache, set_cache } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { load_parties } from "./load_parties"
import { parse_result } from "./plot/plot_simulation"
import { parties_equals } from "./std_lib"
import { Canvas } from "./types"

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

export function replot(simulation_canvas: Canvas) {
  const parties = load_parties()
  if (cache && parties_equals(cache.parties, parties)) {
    const new_cache = cache.cache.map(parse_result)
    set_cache({ cache: new_cache, parties })
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, new_cache.map(p => p.color))
  }
}

