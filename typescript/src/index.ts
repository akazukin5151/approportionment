import * as d3 from 'd3';
import { BaseType } from 'd3-selection';

type Circle = { x: number, y: number, index: number };

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

function load_circles(
  x_scale: d3.ScaleLinear<number, number, never>,
  y_scale: d3.ScaleLinear<number, number, never>
): Array<Circle> {
  return [
    { x: -0.7, y: 0.7, index: 0 },
    { x: 0.7, y: 0.7, index: 1 },
    { x: 0.7, y: -0.7, index: 2 },
    { x: -0.7, y: -0.7, index: 3 },
  ].map(({ x, y, index }) => ({ x: x_scale(x), y: y_scale(y), index }))
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

  const circles = load_circles(x_scale, y_scale);

  // BaseType | SVGCircleElement
  const drag = d3.drag<any, Circle>()
    .on("start", drag_started)
    .on("drag", dragging)
    .on("end", drag_ended);

  svg.selectAll("circle")
    .data(circles)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", circle_radius)
    .attr("fill", d => d3.schemeCategory10[d.index % 10])
    .call(drag);
}

main()
