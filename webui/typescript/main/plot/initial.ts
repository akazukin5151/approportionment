import { set_cache } from "../cache"
import { plot_colors_to_canvas } from "../canvas"
import { get_cmap_name, } from "../form"
import { calculate_colors_and_legend } from "../map_to_colors/map_to_colors"
import { Canvas } from "../types/canvas"
import { SimulationResults } from "../types/election"
import { rebuild_legend } from "../legend"
import { AppCache } from "../types/cache"

export function plot_simulation(
  canvas: Canvas,
  cc: SimulationResults,
): void {
  const cmap_name = get_cmap_name()
  const { colors, legend } = calculate_colors_and_legend(cc, cmap_name)
  plot_colors_to_canvas(canvas, colors)
  const cache: AppCache = {
    cache: cc,
    colors,
    legend,
  }
  set_cache(cache)
  rebuild_legend(canvas, cache, cmap_name)
}

