import { plot_colors_to_canvas } from '../canvas';
import { calculate_colors_and_legend } from '../process_results';
import { SimulationResults, Canvas, ColorsAndLegend } from '../types';
import { rebuild_legend } from './replot';

export function plot_simulation(
  canvas: Canvas,
  r: SimulationResults
): ColorsAndLegend {
  const { colors, legend } = calculate_colors_and_legend(r)
  plot_colors_to_canvas(canvas, 0, colors)
  rebuild_legend(legend)
  return { colors, legend }
}

