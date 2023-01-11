import * as d3_scale_chromatic from 'd3-scale-chromatic';
import { Canvas } from '../canvas';
import { SimulationPoint, Rgb, SimulationResult, WasmResult } from '../types';

export function plot_simulation(
  canvas: Canvas,
  progress: HTMLProgressElement | null,
  msg: MessageEvent<WasmResult>
): Array<SimulationPoint> {
  const r = msg.data.answer!;
  const points = parse_results(r)

  const colors: Array<Rgb> =
    points.map(p => {
      //  0123456
      // '#fae213'
      const r = parseInt(p.color.slice(1, 3), 16)
      const g = parseInt(p.color.slice(3, 5), 16)
      const b = parseInt(p.color.slice(5), 16)
      return {r, g, b}
    })

  canvas.plot_between(0, canvas.image_data_len, colors)
  canvas.putImageData()

  if (progress) {
    progress.value = 0;
  }
  return points
}

function parse_results(r: SimulationResult): Array<SimulationPoint> {
  return r.map(({ voter_mean, seats_by_party }) => {
    const vx: number = voter_mean.x;
    const vy = voter_mean.y;
    const party_to_colorize = get_party_to_colorize();
    const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
    const cmap = get_cmap()
    const color = cmap[seats_for_party_to_colorize % cmap.length]!;
    return { x: vx, y: vy, color, seats_by_party };
  })
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

