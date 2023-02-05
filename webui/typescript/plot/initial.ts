import { set_cache } from "../cache"
import { plot_colors_to_canvas } from "../canvas"
import { get_cmap_name, load_parties } from "../form"
import { calculate_colors_and_legend } from "../process_results/process_results"
import { Canvas } from "../types/canvas"
import { SimulationResults } from "../types/election"
import { rebuild_legend } from "../legend"

export function plot_simulation(
  canvas: Canvas,
  cc: SimulationResults,
): void {
  const cmap_name = get_cmap_name()
  const { colors, legend } = calculate_colors_and_legend(cc, cmap_name)
  plot_colors_to_canvas(canvas, colors)
  const cache = {
    cache: cc,
    colors,
    legend,
    parties: load_parties()
  }
  set_cache(cache)
  rebuild_legend(canvas, cache, cmap_name)
}

