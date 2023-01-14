import { plot_colors_to_canvas } from '../canvas';
import { SimulationPoint, SimulationResults, Canvas } from '../types';
import { process_color } from '../plot_utils';

export function plot_simulation(
  canvas: Canvas,
  r: SimulationResults
): Array<SimulationPoint> {
  const points = process_color(r)

  // informal timings suggests that this is extremely fast already
  // so there's no need to use wasm to fill in the image data array
  plot_colors_to_canvas(canvas, 0, points.map(p => p.color))

  return points
}

