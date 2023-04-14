import { party_bar_chart, cache, party_manager } from "../cache"
import { clear_canvas, plot_colors_to_canvas } from "../canvas"
import { Canvas } from "../types/canvas"
import { calculate_colors_and_legend } from "../process_results/process_results"
import { get_cmap_name } from "../form"
import { rebuild_legend } from "../legend"

export function replot(simulation_canvas: Canvas): void {
  if (cache && !party_manager.party_changed) {
    const cmap_name = get_cmap_name()
    const { colors, legend } = calculate_colors_and_legend(cache.cache, cmap_name)
    cache.colors = colors
    cache.legend = legend
    clear_canvas(simulation_canvas.ctx)
    plot_colors_to_canvas(simulation_canvas, colors)
    party_bar_chart.plot_middle(cache)
    rebuild_legend(simulation_canvas, cache, cmap_name)
  }
}
