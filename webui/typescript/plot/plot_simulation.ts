import * as d3_scale_chromatic from 'd3-scale-chromatic';
import { plot_colors_to_canvas } from '../canvas';
import { SimulationPoint, SimulationResults, Canvas, SimulationResult } from '../types';
import { parse_color } from '../utils';

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
  {x, y, seats_by_party}: SimulationResult
): SimulationPoint {
  const party_to_colorize = get_party_to_colorize();
  const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
  const cmap = get_cmap()
  const color = cmap[seats_for_party_to_colorize % cmap.length]!;
  const rgb = parse_color(color)
  return { x, y, color: rgb, seats_by_party };
}

function get_party_to_colorize() {
  const radio = document.getElementsByClassName('party_radio');
  const checked = Array.from(radio)
    .map((elem, idx) => ({ elem, idx }))
    .find(({ elem }) => (elem as HTMLInputElement).checked);
  return checked?.idx ?? 2
}

function get_cmap(): Array<string> {
  const select = document.getElementById('cmap_select')!
  const discrete = select.children[0]!
  const discrete_cmap = Array.from(discrete.children)
    .find(opt => (opt as HTMLOptionElement).selected)
  const name = (discrete_cmap as HTMLOptionElement).value
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return d3_scale_chromatic[`scheme${name}`]
}

