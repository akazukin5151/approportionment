import * as d3 from 'd3';
import { BaseType } from 'd3-selection';
import { Circle } from './types';

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

type Setup = {
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  x_scale: d3.ScaleLinear<number, number, never>;
  y_scale: d3.ScaleLinear<number, number, never>;
  drag: d3.DragBehavior<any, Circle, Circle | d3.SubjectPosition>;
};

export function setup_svg(): Setup {
  // Setup variables
  const elem = "#chart"
  const box_width = 600
  const box_height = 600

  const x_scale = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, box_width])

  const y_scale = d3.scaleLinear()
    .domain([-1, 1])
    .range([box_height, 0])

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

  return { svg, x_scale, y_scale, drag }
}
