import * as d3 from 'd3';
import { BaseType } from 'd3-selection';
import { Circle, Setup } from './types';
import { box_height, box_width, x_scale, y_scale } from './utils';

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
  const table = document.getElementById('party_table')
  const tbody = table?.children[0]
  if (!tbody) { return }
  Array.from(tbody.children).forEach(tr => {
    const color_picker = tr.children[2].children[0] as HTMLInputElement
    if (
      color_picker
      && color_picker.value.toLowerCase() === datum.color.toLowerCase()
    ) {
      tr.children[3].innerHTML = x_scale.invert(event.x).toFixed(5)
      tr.children[4].innerHTML = y_scale.invert(event.y).toFixed(5)
    }
  })
}

function drag_ended(this: BaseType | SVGCircleElement) {
  d3.select(this).attr("stroke", null);
}

export function setup_svg(): Setup {
  // Setup variables
  const elem = "#chart"
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
