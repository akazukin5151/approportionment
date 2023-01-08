import * as PIXI from 'pixi.js'
import * as d3_scale_chromatic from 'd3-scale-chromatic';
import { Point, WorkerMessage } from './types';
import { color_str_to_num, x_scale, y_scale } from './utils';

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
    const ps = points.slice()
    const l = points.length
    for (let i = 0; i < l; i++) {
      const chunk = pop_random_from_array(ps, 1);
      if (chunk[0]) {
        const p = chunk[0]
        setTimeout(() => {
          graphics.beginFill(p.color, 1);
          graphics.drawCircle(x_scale(p.x), y_scale(p.y), 2);
          graphics.endFill();
        }, random_int(500, 2000))
      }
    }
  } else {
    points.forEach(p => {
      graphics.beginFill(p.color, 1);
      graphics.drawCircle(x_scale(p.x), y_scale(p.y), 2);
      graphics.endFill();
    })
  }

  if (progress) {
    progress.value = 0;
  }
  return points
}

function pop_random_from_array<T>(arr: Array<T>, n_items: number): Array<T> {
  const result = []
  for (let i = 0; i < n_items; i++) {
    const idx_to_remove = random_int(0, arr.length - 1)
    const removed = arr.splice(idx_to_remove, 1)
    if (removed[0]) {
      result.push(removed[0])
    }
  }
  return result
}

function random_int(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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


