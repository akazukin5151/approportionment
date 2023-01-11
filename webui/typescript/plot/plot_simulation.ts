import * as d3_scale_chromatic from 'd3-scale-chromatic';
import { Canvas, Point, Rgb, Simulation, WorkerMessage } from '../types';

export function plot_simulation(
  canvas: Canvas,
  progress: HTMLProgressElement | null,
  msg: MessageEvent<WorkerMessage>
): Array<Point> {
  const r = msg.data.answer!;
  const points = parse_results(r)

  let color_i = 0
  const colors: Array<Rgb> =
    points.map(p => {
      //  0123456
      // '#fae213'
      const r = parseInt(p.color.slice(1, 3), 16)
      const g = parseInt(p.color.slice(3, 5), 16)
      const b = parseInt(p.color.slice(5), 16)
      return {r, g, b}
    })

  for (let i = 0; i < canvas.image_data.data.length; i += 4) {
    const color = colors[color_i]
    canvas.image_data.data[i + 0] = color?.r ?? 255
    canvas.image_data.data[i + 1] = color?.g ?? 255
    canvas.image_data.data[i + 2] = color?.b ?? 255
    canvas.image_data.data[i + 3] = 255
    color_i += 1
  }
  canvas.ctx.putImageData(canvas.image_data, 0, 0)

  //const checkbox = document.getElementById('incremental_plot') as HTMLInputElement
  //if (checkbox.checked) {
  //  plot_incremental(graphics, points)
  //} else {
  //  points.forEach(p => plot_point(graphics, p))
  //}

  if (progress) {
    progress.value = 0;
  }
  return points
}

function parse_results(r: Simulation): Array<Point> {
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

