import * as d3 from 'd3';
import { BaseType } from 'd3-selection';

type Circle = { x: number, y: number, index: number };

function drag_started(this: BaseType | SVGCircleElement) {
  d3.select(this).attr("stroke", "black");
}

function dragging(
  this: BaseType | SVGCircleElement,
  event: any,
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
  box_width: number,
  box_height: number,
  circle_radius: number
): Array<Circle> {
  return d3.range(20).map(i => ({
    x: Math.random() * (box_width - circle_radius * 2) + circle_radius,
    y: Math.random() * (box_height - circle_radius * 2) + circle_radius,
    index: i
  }));
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

  const circles = load_circles(box_width, box_height, circle_radius);

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
