import * as d3 from 'd3';
import { BaseType } from 'd3-selection';

// This array has a len of 200 * 200 (the domain and range of the graph)
type Simulation = Array<
  // This array always has a len of 2. It is a tuple of (voter means, seats by party)
  Array<
    // Voter means: The array always has len of 2, as it is a tuple of (x, y)
    // Seats by party: The array always has len of n_parties. The value of the ith element
    // is the number of seats won by the ith party
    Array<number>
  >
>;

// for rgb values, stringify to `'rgb(1, 2, 3)'`
type Color = string;

type Circle = { x: number, y: number, color: Color };

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

function load_parties(): Array<Circle> {
  return [
    { x: -0.7, y: 0.7, color: 'red' },
    { x: 0.7, y: 0.7, color: 'red' },
    { x: 0.7, y: -0.7, color: 'red' },
    { x: -0.7, y: -0.7, color: 'red' },
  ]
}


function main() {
  const elem = "#chart"
  const box_width = 600
  const box_height = 600
  const circle_radius = 20

  const svg = d3.select(elem)
    .append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .attr("viewBox", [0, 0, box_width, box_height])
    .attr("stroke-width", 2);

  const x_scale = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, box_width])

  const y_scale = d3.scaleLinear()
    .domain([-1, 1])
    .range([box_height, 0])

  // TODO
  const party_to_colorize = 3;
  const cmap = d3.schemeCategory10;

  const parties = load_parties();

  const progress = document.querySelector('progress')

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<{answer: Simulation}>) => {
    const r = msg.data.answer;
    const points = r.map(([voter_mean, seats_by_party]) => {
      const vx = x_scale(voter_mean[0]);
      const vy = y_scale(voter_mean[1]);
      const seats_for_party_to_colorize = seats_by_party[party_to_colorize];
      const color = cmap[seats_for_party_to_colorize];
      return { x: vx, y: vy, color };
    })

    // BaseType | SVGCircleElement
    const drag = d3.drag<any, Circle>()
      .on("start", drag_started)
      .on("drag", dragging)
      .on("end", drag_ended);

    const svg_circle_element = "circle";

    const p = parties
      .map(({ x, y, color }) => ({ x: x_scale(x), y: y_scale(y), color }));

    svg.selectAll("parties")
      .data(p)
      .join(svg_circle_element)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", circle_radius)
      .attr("fill", d => d.color)
      .call(drag);

    svg.selectAll("points")
      .data(points)
      .join(svg_circle_element)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 1)
      .attr("fill", d => d.color);

    if (progress) {
      progress.value = 0;
    }
  }

  const button = document.querySelector('button')
  button?.addEventListener('click', () => {
    if (progress) {
      progress.removeAttribute('value');
    }
    worker.postMessage({ parties: parties });
  })
}

main()

