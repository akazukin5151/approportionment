import { clear_canvas, plot_colors_to_canvas } from "../canvas"
import {
  calculate_seat_coords,
  map_party_to_circumference
} from "../colormap_nd/colormap_nd"
import { map_to_lch } from "../colormap_nd/colors"
import { AppCache, Canvas, GridCoords } from "../types"
import { plot_parties_on_circumference } from "./plot_parties"
import { should_expand_points, table_trs } from "../form"
import { MAX_RADIUS, ORIGIN } from "./constants"
import { plot_mapped_seats } from "./plot"

export function replot_on_drag(
  cache: AppCache,
  party_canvas: Canvas,
  seat_ctx: CanvasRenderingContext2D,
  simulation_canvas: Canvas,
  angle: number
): void {
  const coords = cache.legend.radviz!.party_coords
  update_party_layer(cache, coords, party_canvas, angle)
  update_seats_layer(cache, coords, seat_ctx)
  update_main_plot(cache, simulation_canvas)
  update_hover_layer()
  update_legend_table(coords)
}

function update_party_layer(
  cache: AppCache,
  coords: Array<GridCoords>,
  party_canvas: Canvas,
  angle: number
): void {
  cache.legend.radviz!.party_coords =
    coords.map((_, i) => map_party_to_circumference(i, coords.length, angle))
  plot_parties_on_circumference(party_canvas.ctx, cache, MAX_RADIUS, ORIGIN)
}

function update_seats_layer(
  cache: AppCache,
  coords: Array<GridCoords>,
  seat_ctx: CanvasRenderingContext2D,
): void {
  cache.legend.radviz!.seat_coords = calculate_seat_coords(
    cache.cache.map(x => x.seats_by_party),
    coords,
    should_expand_points(),
    coords.length
  )
  clear_canvas(seat_ctx)
  plot_mapped_seats(seat_ctx, cache.legend, MAX_RADIUS, ORIGIN)
}

/** Replot the main plot as the colors have changed **/
function update_main_plot(cache: AppCache, simulation_canvas: Canvas): void {
  const colors = map_to_lch(cache.legend.radviz!.seat_coords)
  plot_colors_to_canvas(simulation_canvas, 0, colors)
}

// can rotate this layer (replotting it)
// needs to have a global to keep track of last hovered point
// the cursor is most likely being moved to the left edge of the plot
// because it needs to reach the color wheel. so the last hovered point is
// unlikely to be useful anyway, so not worth it considering performance
function update_hover_layer(): void {
  const canvas = document.getElementById('color-wheel-hover') as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  clear_canvas(ctx)
}

function update_legend_table(party_coords: Array<GridCoords>): void {
  const colors = map_to_lch(party_coords)
  table_trs('legend-table').forEach((tr, idx) => {
    const color_td = tr.children[0]!
    const color_div = color_td.children[0] as HTMLElement
    color_div.style.backgroundColor = colors[idx]!.toString()
  })
}
