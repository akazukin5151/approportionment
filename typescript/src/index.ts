import * as d3 from 'd3';
import { BaseType } from 'd3-selection';

function drag_started(this: BaseType | SVGCircleElement) {
  d3.select(this).attr("stroke", "black");
}

function dragging(
  this: BaseType | SVGCircleElement,
  event: any,
  datum: { x: number, y: number }
) {
  d3.select(this)
    .raise()
    .attr("cx", datum.x = event.x)
    .attr("cy", datum.y = event.y);
}

function drag_ended(this: BaseType | SVGCircleElement) {
  d3.select(this).attr("stroke", null);
}

function main() {
  const elem = "#chart"
  const width = 600
  const height = 600
  const radius = 20

  const svg = d3.select(elem)
    .append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .attr("viewBox", [0, 0, width, height])
    .attr("stroke-width", 2);

  const circles = d3.range(20).map(i => ({
    x: Math.random() * (width - radius * 2) + radius,
    y: Math.random() * (height - radius * 2) + radius,
    index: i
  }));

  // BaseType | SVGCircleElement
  const drag = d3.drag<any, { x: number, y: number, index: number }>()
    .on("start", drag_started)
    .on("drag", dragging)
    .on("end", drag_ended);

  svg.selectAll("circle")
    .data(circles)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", radius)
    .attr("fill", d => d3.schemeCategory10[d.index % 10])
    .call(drag);
}

main()
