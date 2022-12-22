import * as d3_scale_chromatic from 'd3-scale-chromatic';
import { Simulation } from './types';
import { color_str_to_num, x_scale, y_scale } from './utils';
import { plot_party_core } from './plot_party'
import * as PIXI from 'pixi.js'
import { load_parties } from './setup'

export function plot_simulation(
  stage: PIXI.Container,
  progress: HTMLProgressElement | null,
  msg: MessageEvent<{ answer: Simulation }>
) {
  const r = msg.data.answer;
  const points = r.map(([voter_mean, seats_by_party]) => {
    const vx = voter_mean[0];
    const vy = voter_mean[1];
    const party_to_colorize = get_party_to_colorize();
    const seats_for_party_to_colorize = seats_by_party[party_to_colorize];
    const cmap = get_cmap()
    const color = color_str_to_num(cmap[seats_for_party_to_colorize % cmap.length]);
    return { x: vx, y: vy, color, seats_by_party };
  })

  const graphics = new PIXI.Graphics();
  points.forEach(p => {
    graphics.lineStyle(0);
    graphics.beginFill(p.color, 1);
    graphics.drawCircle(x_scale(p.x), y_scale(p.y), 2);
    graphics.endFill();
    graphics.zIndex = 0
  })
  stage.addChild(graphics);
  stage.sortChildren()

  if (progress) {
    progress.value = 0;
  }
  return points
}

function get_party_to_colorize() {
  const radio = document.getElementsByClassName('party_radio');
  const checked = Array.from(radio)
    .map((elem, idx) => ({ elem, idx }))
    .find(({ elem, idx: _ }) => (elem as HTMLInputElement).checked);
  return checked?.idx ?? 2
}

function get_cmap() {
  const select = document.getElementById('cmap_select')!
  const discrete = select.children[0]
  const discrete_cmap = Array.from(discrete.children)
    .find(opt => (opt as HTMLOptionElement).selected)
  const name = (discrete_cmap as HTMLOptionElement).value
  // @ts-ignore
  return d3_scale_chromatic[`scheme${name}`]
}

export function plot_default(stage: PIXI.Container) {
  const parties = load_parties(stage);

  const p = parties
    .map(({ x, y, color, num }) => ({ x: x_scale(x), y: y_scale(y), color, num }));

  plot_party_core(stage, p)
}

