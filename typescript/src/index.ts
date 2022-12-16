import * as d3 from 'd3';
import { Simulation, Party, Setup } from './types';
import { setup_svg } from './setup';
import { setup_party_buttons } from './party_tables';
import { DEFAULT_PARTIES, x_scale, y_scale } from './constants';
import { plot_party_core, SVG_CIRCLE_ELEMENT } from './utils';

function load_parties(
  x_scale: d3.ScaleLinear<number, number, never>,
  y_scale: d3.ScaleLinear<number, number, never>
): Array<Party> {
  const elems = document.getElementsByClassName('party-circle');
  if (elems && elems.length !== 0) {
    return Array.from(elems)
      .map((elem) => {
        const cx = parseFloat(elem.getAttribute('cx') ?? '0')
        const cy = parseFloat(elem.getAttribute('cy') ?? '0')
        const x = x_scale.invert(cx)
        const y = y_scale.invert(cy)
        const color = elem.getAttribute('fill') ?? 'red'
        const num = parseInt(elem.getAttribute('num')!)
        return { x, y, color: color, num }
      })
      .sort((a, b) => a.num - b.num)
  }
  return DEFAULT_PARTIES
}


function plot_simulation(
  { svg, drag: _ }: Setup,
  progress: HTMLProgressElement | null,
  cmap: readonly string[],
  msg: MessageEvent<{ answer: Simulation }>
) {
  svg.selectAll(".points").remove();
  const r = msg.data.answer;
  const points = r.map(([voter_mean, seats_by_party]) => {
    const vx = x_scale(voter_mean[0]);
    const vy = y_scale(voter_mean[1]);
    const party_to_colorize = get_party_to_colorize();
    const seats_for_party_to_colorize = seats_by_party[party_to_colorize];
    const color = cmap[seats_for_party_to_colorize];
    return { x: vx, y: vy, color };
  })

  svg.select('#vm_points').selectAll(".vm_point")
    .data(points)
    .join(SVG_CIRCLE_ELEMENT)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 2)
    .attr("fill", d => d.color)
    .attr('class', 'points');

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

function plot_default(setup: Setup) {
  const parties = load_parties(x_scale, y_scale);

  const p = parties
    .map(({ x, y, color, num }) => ({ x: x_scale(x), y: y_scale(y), color, num }));

  plot_party_core(setup, p)
}

function setup_worker(
  setup: Setup,
  cmap: readonly string[],
  progress: HTMLProgressElement | null,
): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<{ answer: Simulation }>) => {
    plot_simulation(setup, progress, cmap, msg)
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
    const parties = load_parties(x_scale, y_scale)
    console.log(parties)
    worker.postMessage({
      parties,
      method,
      n_seats,
      n_voters,
    });
  });
}

function main() {
  const setup = setup_svg();
  setup_party_buttons(setup)

  // TODO - get from html form
  const cmap = d3.schemeCategory10;

  plot_default(setup);

  const progress = document.querySelector('progress')
  const worker = setup_worker(setup, cmap, progress)
  setup_form_handler(progress, worker)
}

main()

