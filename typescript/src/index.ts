import * as d3 from 'd3';
import { Simulation, Circle, Setup } from './types';
import { setup_svg } from './setup';

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
  return [
    { x: -0.7, y: 0.7, color: 'red' },
    { x: 0.7, y: 0.7, color: 'red' },
    { x: 0.7, y: -0.7, color: 'red' },
    { x: -0.7, y: -0.7, color: 'red' },
  ]
}


function plot_simulation(
  { svg, x_scale, y_scale, drag: _ }: Setup,
  progress: HTMLProgressElement | null,
  cmap: readonly string[],
  party_to_colorize: number,
  msg: MessageEvent<{ answer: Simulation }>
) {
  svg.selectAll(".points").remove();
  const r = msg.data.answer;
  const points = r.map(([voter_mean, seats_by_party]) => {
    const vx = x_scale(voter_mean[0]);
    const vy = y_scale(voter_mean[1]);
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

function plot_default({ svg, x_scale, y_scale, drag }: Setup) {
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
  party_to_colorize: number,
  progress: HTMLProgressElement | null,
): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<{ answer: Simulation }>) => {
    plot_simulation(setup, progress, cmap, party_to_colorize, msg)
  }
  return worker
}

function setup_form_handler(
  { svg: _, x_scale, y_scale, drag: __ }: Setup,
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
  const setup = setup_svg();

  // TODO - get from html form
  const party_to_colorize = 3;
  const cmap = d3.schemeCategory10;

  plot_default(setup);

  const progress = document.querySelector('progress')
  const worker = setup_worker(setup, cmap, party_to_colorize, progress)
  setup_form_handler(setup, progress, worker)
}

main()

