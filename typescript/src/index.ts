import * as d3 from 'd3';
import { BaseType } from 'd3-selection';

const elem = "#chart"

const width = 600
const height = 600
const radius = 32

function dragstarted(this: SVGCircleElement) {
  d3.select(this).attr("stroke", "black");
}

function dragged(this: SVGCircleElement, event: any, d: { x: number, y: number }) {
  d3.select(this).raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
}

function dragended(this: SVGCircleElement) {
  d3.select(this).attr("stroke", null);
}

const drag = d3.drag<SVGCircleElement, { x: number, y: number, index: number }>()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

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

svg.selectAll("circle")
  .data(circles)
  .join("circle")
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", radius)
  .attr("fill", d => d3.schemeCategory10[d.index % 10])
  // @ts-ignore
  .call(drag)
  .on("click", clicked);

function clicked(this: SVGCircleElement | BaseType, event: any, d: { x: number; y: number; index: number; }) {
  if (event.defaultPrevented) return; // dragged

  d3.select(this).transition()
    .attr("fill", "black")
    .attr("r", radius * 2)
    .transition()
    .attr("r", radius)
    .attr("fill", d3.schemeCategory10[d.index % 10]);
}

const chart = svg.node();
