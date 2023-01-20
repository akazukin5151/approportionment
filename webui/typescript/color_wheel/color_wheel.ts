import { clear_canvas, plot_colors_to_canvas } from "../canvas"
import {
  calculate_seat_coords,
  map_party_to_circumference
} from "../colormap_nd/colormap_nd"
import { map_to_lch } from "../colormap_nd/colors"
import { AppCache, Canvas, GridCoords } from "../types"
import { on_drag_start } from "./drag"
import { plot_parties_on_circumference } from "./plot_parties"
import { should_expand_points, table_trs } from "../form"
import { plot_on_colorwheel, plot_party_on_wheel, plot_seats_on_wheel } from "./canvas"
import { MAX_RADIUS, ORIGIN } from "./constants"
import { plot_mapped_seats } from "./plot"

export function plot_color_wheel_legend(
  simulation_canvas: Canvas,
  cache: AppCache
): void {
  const container = document.getElementById('color-wheel-container')!
  container.style.display = 'initial'
  container.className = 'wh-200'

  plot_on_colorwheel()
  const seat_ctx = plot_seats_on_wheel(cache)
  const canvas = plot_party_on_wheel(cache)

  canvas.elem.addEventListener(
    'mousedown',
    e => on_drag_start(
      canvas.ctx, e, cache.legend.radviz!.party_coords,
      angle => replot_on_drag(cache, canvas, seat_ctx, simulation_canvas, angle)
    )
  )
}

function replot_on_drag(
  cache: AppCache,
  party_canvas: Canvas,
  seat_ctx: CanvasRenderingContext2D,
  simulation_canvas: Canvas,
  angle: number
) {
  const coords = cache.legend.radviz!.party_coords
  cache.legend.radviz!.party_coords =
    coords.map((_, i) => map_party_to_circumference(i, coords.length, angle))
  plot_parties_on_circumference(party_canvas.ctx, cache, MAX_RADIUS, ORIGIN)

  update_legend_table(coords)

  cache.legend.radviz!.seat_coords = calculate_seat_coords(
    cache.cache.map(x => x.seats_by_party),
    coords,
    should_expand_points(),
    coords.length
  )
  clear_canvas(seat_ctx)
  plot_mapped_seats(seat_ctx, cache.legend, MAX_RADIUS, ORIGIN)

  const colors = map_to_lch(cache.legend.radviz!.seat_coords)
  plot_colors_to_canvas(simulation_canvas, 0, colors)
}

function update_legend_table(party_coords: Array<GridCoords>): void {
  const colors = map_to_lch(party_coords)
  table_trs('legend-table').forEach((tr, idx) => {
    const color_td = tr.children[0]!
    const color_div = color_td.children[0] as HTMLElement
    color_div.style.backgroundColor = colors[idx]!.toString()
  })
}
