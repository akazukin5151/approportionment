import { plot_colors_to_canvas } from '../canvas';
import { Colormap } from '../setup/setup_colorscheme_select';
import { SimulationPoint, SimulationResults, Canvas, SimulationResult } from '../types';
import { array_sum } from '../utils';

export function plot_simulation(
  canvas: Canvas,
  r: SimulationResults
): Array<SimulationPoint> {
  const points = r.map(parse_result)

  // informal timings suggests that this is extremely fast already
  // so there's no need to use wasm to fill in the image data array
  plot_colors_to_canvas(canvas, 0, points.map(p => p.color))

  return points
}

export function parse_result(
  { x, y, seats_by_party }: SimulationResult
): SimulationPoint {
  const party_to_colorize = get_party_to_colorize();
  const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
  const cmap = new Colormap()
  const color = cmap.map(seats_for_party_to_colorize, array_sum(seats_by_party));
  return { x, y, color, seats_by_party };
}

function get_party_to_colorize() {
  const radio = document.getElementsByClassName('party_radio');
  const checked = Array.from(radio)
    .map((elem, idx) => ({ elem, idx }))
    .find(({ elem }) => (elem as HTMLInputElement).checked);
  return checked?.idx ?? 2
}

