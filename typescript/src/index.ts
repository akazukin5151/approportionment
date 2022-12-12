import * as d3 from 'd3';
import { BaseType } from 'd3-selection';

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

function load_points(): Array<Circle> {
  return d3.ticks(-1, 1, 100).flatMap((x) =>
    d3.ticks(-1, 1, 100).map((y) => ({ x, y, color: 'gray' }))
  )
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

  const parties = load_parties()
    .map(({ x, y, color }) => ({ x: x_scale(x), y: y_scale(y), color }));

  const points = load_points()
    .map(({ x, y, color }) => ({ x: x_scale(x), y: y_scale(y), color }));

  // BaseType | SVGCircleElement
  const drag = d3.drag<any, Circle>()
    .on("start", drag_started)
    .on("drag", dragging)
    .on("end", drag_ended);

  const svg_circle_element = "circle";

  svg.selectAll("parties")
    .data(parties)
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
    .attr("fill", 'gray');
}

main()
