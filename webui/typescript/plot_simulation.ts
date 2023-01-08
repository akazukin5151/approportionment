import * as PIXI from 'pixi.js'
import * as d3_scale_chromatic from 'd3-scale-chromatic';
import { Point, WorkerMessage } from './types';
import { color_str_to_num, pop_random_from_array, random_int, x_scale, y_scale } from './utils';

export function plot_simulation(
  stage: PIXI.Container,
  progress: HTMLProgressElement | null,
  msg: MessageEvent<WorkerMessage>
): Array<Point> {
  const r = msg.data.answer!;
  const points = r.map(({ voter_mean, seats_by_party }) => {
    const vx: number = voter_mean.x;
    const vy = voter_mean.y;
    const party_to_colorize = get_party_to_colorize();
    const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
    const cmap = get_cmap()
    const color = color_str_to_num(cmap[seats_for_party_to_colorize % cmap.length]!);
    return { x: vx, y: vy, color, seats_by_party };
  })

  const graphics = new PIXI.Graphics();
  graphics.lineStyle(0);
  graphics.zIndex = 0
  stage.addChild(graphics);
  stage.sortChildren()

  const checkbox = document.getElementById('incremental_plot') as HTMLInputElement
  if (checkbox.checked) {
    plot_incremental(graphics, points)
  } else {
    points.forEach(p => plot_point(graphics, p))
  }

  if (progress) {
    progress.value = 0;
  }
  return points
}

function plot_point(graphics: PIXI.Graphics, p: Point) {
  graphics.beginFill(p.color, 1);
  graphics.drawCircle(x_scale(p.x), y_scale(p.y), 2);
  graphics.endFill();
}

function plot_incremental(graphics: PIXI.Graphics, points: Array<Point>) {
  const ps = points.slice()
  const l = points.length
  for (let i = 0; i < l; i++) {
    const chunk = pop_random_from_array(ps, 1);
    if (chunk[0]) {
      const p = chunk[0]
      setTimeout(() => plot_point(graphics, p), random_int(500, 2000))
    }
  }
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


