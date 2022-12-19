import { Simulation, Party } from './types';
import { DEFAULT_PARTIES } from './constants';
import { color_str_to_num, unscale_x, unscale_y } from './utils';
import { DISCRETE_CMAPS } from './cmaps';
import * as PIXI from 'pixi.js'
import { plot_simulation } from './plot';

export function setup_indicator() {
  const text = document.createTextNode(PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas')
  const p = document.createElement('p')
  p.appendChild(text)
  document.body.appendChild(p);
}

export function load_cmaps() {
  const select = document.getElementById('cmap_select')!
  const discrete_group = populate_optgroup(DISCRETE_CMAPS)
  discrete_group.label = 'Discrete'
  select.appendChild(discrete_group)

  // TODO: continuous cmaps
  //const continuous_group = populate_optgroup(CONTINUOUS_CMAPS)
  //continuous_group.label = 'Continuous'
  //select.appendChild(continuous_group)
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

export function load_parties(): Array<Party> {
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

export function setup_worker(
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

export function setup_form_handler(
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
