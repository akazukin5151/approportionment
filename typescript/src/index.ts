import * as d3 from 'd3';
import { Simulation, Circle, Setup } from './types';
import { setup_svg } from './setup';
import { setup_party_buttons} from './party_tables';
import { DEFAULT_PARTIES, x_scale, y_scale } from './utils';

const SVG_CIRCLE_ELEMENT = "circle";

function load_parties(
  x_scale: d3.ScaleLinear<number, number, never>,
  y_scale: d3.ScaleLinear<number, number, never>
): Array<Circle> {
  const elems = document.getElementsByClassName('party-circle');
  if (elems && elems.length !== 0) {
    return Array.from(elems).map((elem) => {
      const cx = parseFloat(elem.getAttribute('cx') ?? '0')
      const cy = parseFloat(elem.getAttribute('cy') ?? '0')
      const x = x_scale.invert(cx)
      const y = y_scale.invert(cy)
      const color = elem.getAttribute('fill') ?? 'red'
      return { x, y, color: color }
    })
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

function plot_default({ svg, drag }: Setup) {
  const parties = load_parties(x_scale, y_scale);

  const p = parties
    .map(({ x, y, color }) => ({ x: x_scale(x), y: y_scale(y), color }));

  svg.select('#party_points').selectAll(".party_point")
    .data(p)
    .join(SVG_CIRCLE_ELEMENT)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 20)
    .attr("fill", d => d.color)
    .attr('class', 'party-circle')
    .call(drag);
}

function setup_worker(
  setup: Setup,
  cmap: readonly string[],
  progress: HTMLProgressElement | null,
): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<{ answer: Simulation }>) => {
    plot_simulation(setup, progress, cmap, msg)
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

    const fd = new FormData(form as HTMLFormElement);
    const method = fd.get('method');
    const n_seats = parseInt(fd.get('n_seats') as string);
    const n_voters = parseInt(fd.get('n_voters') as string);

    if (progress) {
      progress.removeAttribute('value');
    }
    worker.postMessage({
      parties: load_parties(x_scale, y_scale),
      method,
      n_seats,
      n_voters,
    });
  });
}

function main() {
  setup_party_buttons()
  const setup = setup_svg();

  // TODO - get from html form
  const cmap = d3.schemeCategory10;

  plot_default(setup);

  const progress = document.querySelector('progress')
  const worker = setup_worker(setup, cmap, progress)
  setup_form_handler(progress, worker)
}

main()

