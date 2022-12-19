import * as d3 from 'd3';
import { Simulation, Party } from './types';
import { setup_party_table } from './party_tables';
import { DEFAULT_PARTIES} from './constants';
import { color_str_to_num, plot_party_core, setup_pixi } from './utils';
import { DISCRETE_CMAPS } from './cmaps';
import * as PIXI from 'pixi.js'

function x_scale(coord_x: number) {
  const percentage = (coord_x + 1) / 2
  return 500 * percentage
}

function y_scale(coord_y: number) {
  const percentage = (coord_y + 1) / 2
  return 500 * (1 - percentage)
}

function unscale_x(canvas_x: number) {
  const percentage = canvas_x / 500
  return percentage * 2 - 1
}

function unscale_y(canvas_y: number) {
  const percentage = canvas_y / 500
  return (1 - percentage) * 2 - 1
}

function setup_indicator() {
  const text = document.createTextNode(PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas')
  const p = document.createElement('p')
  p.appendChild(text)
  document.body.appendChild(p);
}

function load_parties(): Array<Party> {
  const elems = document.getElementsByClassName('party-circle');
  if (elems && elems.length !== 0) {
    return Array.from(elems)
      .map((elem) => {
        const cx = parseFloat(elem.getAttribute('cx') ?? '0')
        const cy = parseFloat(elem.getAttribute('cy') ?? '0')
        const x = unscale_x(cx)
        const y = unscale_y(cy)
        const color = color_str_to_num(elem.getAttribute('fill')!)
        const num = parseInt(elem.getAttribute('num')!)
        return { x, y, color: color, num }
      })
      .sort((a, b) => a.num - b.num)
  }
  return DEFAULT_PARTIES
}

function plot_simulation(
  stage: PIXI.Container,
  progress: HTMLProgressElement | null,
  msg: MessageEvent<{ answer: Simulation }>
) {
  const r = msg.data.answer;
  const points = r.map(([voter_mean, seats_by_party]) => {
    const vx = x_scale(voter_mean[0]);
    const vy = y_scale(voter_mean[1]);
    const party_to_colorize = get_party_to_colorize();
    const seats_for_party_to_colorize = seats_by_party[party_to_colorize];
    const cmap = get_cmap()
    const color = color_str_to_num(cmap[seats_for_party_to_colorize]);
    return { x: vx, y: vy, color };
  })

  //.attr('class', 'points');

  const graphics = new PIXI.Graphics();
  points.forEach(p => {
    graphics.lineStyle(0);
    graphics.beginFill(p.color, 1);
    graphics.drawCircle(p.x, p.y, 2);
    graphics.endFill();
  })
  stage.addChild(graphics);

  if (progress) {
    progress.value = 0;
  }
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
  return d3[`scheme${name}`]
}

function plot_default(stage: PIXI.Container) {
  const parties = load_parties();

  const p = parties
    .map(({ x, y, color, num }) => ({ x: x_scale(x), y: y_scale(y), color, num }));

  plot_party_core(stage, p)
}

function setup_worker(
  stage: PIXI.Container,
  progress: HTMLProgressElement | null
): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<{ answer: Simulation }>) => {
    plot_simulation(stage, progress, msg)
    const btn = document.getElementById('run-btn') as HTMLFormElement
    btn.disabled = false
  }
  return worker
}

function setup_form_handler(
  progress: HTMLProgressElement | null,
  worker: Worker
) {
  const form = document.getElementById("myform");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const btn = event.submitter as HTMLFormElement
    btn.disabled = true

    const fd = new FormData(form as HTMLFormElement);
    const method = fd.get('method');
    const n_seats = parseInt(fd.get('n_seats') as string);
    const n_voters = parseInt(fd.get('n_voters') as string);

    if (progress) {
      progress.removeAttribute('value');
    }
    const parties = load_parties()
    worker.postMessage({
      parties,
      method,
      n_seats,
      n_voters,
    });
  });
}

function populate_optgroup(cmap: string[]) {
  const optgroup = document.createElement('optgroup')
  cmap.forEach(cmap => {
    const option = document.createElement('option')
    option.value = cmap
    option.innerText = cmap
    // our default cmap
    if (cmap === 'Category10') {
      option.selected = true
    }
    optgroup.appendChild(option)
  })
  return optgroup
}

function load_cmaps() {
  const select = document.getElementById('cmap_select')!
  const discrete_group = populate_optgroup(DISCRETE_CMAPS)
  discrete_group.label = 'Discrete'
  select.appendChild(discrete_group)

  // TODO: continuous cmaps
  //const continuous_group = populate_optgroup(CONTINUOUS_CMAPS)
  //continuous_group.label = 'Continuous'
  //select.appendChild(continuous_group)
}

function main() {
  load_cmaps()
  setup_indicator()
  const stage = setup_pixi()
  setup_party_table(stage)

  plot_default(stage);

  const progress = document.querySelector('progress')
  const worker = setup_worker(stage, progress)
  setup_form_handler(progress, worker)
}

main()

