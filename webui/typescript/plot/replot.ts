import { party_bar_chart, cache, party_manager } from "../cache"
import { clear_canvas, plot_colors_to_canvas } from "../canvas"
import { Canvas } from "../types/canvas"
import { calculate_colors_and_legend } from "../map_to_colors/map_to_colors"
import { get_cmap_name } from "../form"
import { rebuild_legend } from "../legend"
import { get_middle } from "../bar_chart"

export function replot(simulation_canvas: Canvas): void {
  if (cache && !party_manager.party_changed) {
    const cmap_name = get_cmap_name()
    const { colors, legend } = calculate_colors_and_legend(cache.cache, cmap_name)
    cache.colors = colors
    cache.legend = legend
    clear_canvas(simulation_canvas.ctx)
    plot_colors_to_canvas(simulation_canvas, colors)
    const seats_by_party = get_middle(cache)
    party_bar_chart.plot(seats_by_party)
    rebuild_legend(simulation_canvas, cache, cmap_name)
  }
}
