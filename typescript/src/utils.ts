import { Circle, Setup } from "./types";

export const SVG_CIRCLE_ELEMENT = "circle";

export function plot_party_core(
  { svg, drag }: Setup,
  p: Array<Circle>
) {
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
