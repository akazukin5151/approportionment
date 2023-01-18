import { plot_colors_to_canvas } from '../canvas';
import { SimulationResults, Canvas, ColorsAndLegend } from '../types';
import { calculate_colors_and_legend, rebuild_legend } from '../plot_utils';

export function plot_simulation(
  canvas: Canvas,
  r: SimulationResults
): ColorsAndLegend {
  const { colors, legend } = calculate_colors_and_legend(r)
  plot_colors_to_canvas(canvas, 0, colors)
  rebuild_legend(legend)
  return { colors, legend }
}

