import * as d3 from 'd3';
import { BaseType } from 'd3-selection';
import { Simulation, Circle } from './types';

const SVG_CIRCLE_ELEMENT = "circle";

function drag_started(this: BaseType | SVGCircleElement) {
  d3.select(this).attr("stroke", "black");
}

function dragging(
  this: BaseType | SVGCircleElement,
  event: { x: number, y: number },
  datum: Circle
) {
  d3.select(this)
    .raise()
    .attr("cx", datum.x = event.x)
    .attr("cy", datum.y = event.y);
}

function drag_ended(this: BaseType | SVGCircleElement) {
  d3.select(this).attr("stroke", null);
}

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
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  progress: HTMLProgressElement | null,
  x_scale: d3.ScaleLinear<number, number, never>,
  y_scale: d3.ScaleLinear<number, number, never>,
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
    .attr("r", 1)
    .attr("fill", d => d.color)
    .attr('class', 'points');

  if (progress) {
    progress.value = 0;
  }
}

function main() {
  // Setup variables
  const elem = "#chart"
  const box_width = 600
  const box_height = 600
  const circle_radius = 20

  const x_scale = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, box_width])

  const y_scale = d3.scaleLinear()
    .domain([-1, 1])
    .range([box_height, 0])

  // Setup svg canvas
  const svg = d3.select(elem)
    .append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .attr("viewBox", [0, 0, box_width, box_height])
    .attr("stroke-width", 2);

  svg.append('g').attr('id', 'vm_points')
  svg.append('g').attr('id', 'party_points')

  // BaseType | SVGCircleElement
  const drag = d3.drag<any, Circle>()
    .on("start", drag_started)
    .on("drag", dragging)
    .on("end", drag_ended);

  // TODO - get from html form
  const party_to_colorize = 3;
  const cmap = d3.schemeCategory10;

  // Plot default parties
  const parties = load_parties(x_scale, y_scale);

  const p = parties
    .map(({ x, y, color }) => ({ x: x_scale(x), y: y_scale(y), color }));

  svg.select('#party_points').selectAll(".party_point")
    .data(p)
    .join(SVG_CIRCLE_ELEMENT)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", circle_radius)
    .attr("fill", d => d.color)
    .attr('class', 'party-circle')
    .call(drag);

  // Setup worker where wasm will be called
  const progress = document.querySelector('progress')

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<{ answer: Simulation }>) => {
    plot_simulation(svg, progress, x_scale, y_scale, cmap, party_to_colorize, msg)
  }

  // Setup button click handler
  const button = document.querySelector('button')
  button?.addEventListener('click', () => {
    if (progress) {
      progress.removeAttribute('value');
    }
    worker.postMessage({
      parties: load_parties(x_scale, y_scale)
    });
  })
}

main()

