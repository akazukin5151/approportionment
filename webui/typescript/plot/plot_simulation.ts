import { plot_colors_to_canvas } from '../canvas';
import { SimulationPoint, SimulationResults, Canvas } from '../types';
import { calculate_cache_and_legend, rebuild_legend } from '../plot_utils';

export function plot_simulation(
  canvas: Canvas,
  r: SimulationResults
): Array<SimulationPoint> {
  const x = calculate_cache_and_legend(r)
  const points = x.new_cache

  // informal timings suggests that this is extremely fast already
  // so there's no need to use wasm to fill in the image data array
  plot_colors_to_canvas(canvas, 0, points.map(p => p.color))
  // TODO: merge with replot
  rebuild_legend(x.legend)

  return points
}

