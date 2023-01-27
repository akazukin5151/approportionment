import * as d3 from "d3-color"
import { LIGHTNESS, MAX_CHROMA, TAU } from "../constants"
import { GridCoords } from "../types/position"
import { angle_of_point } from "./angle"

export function map_to_lch(seats: Array<GridCoords>): Array<d3.RGBColor> {
  const colors = []
  for (const p of seats) {
    // d3 needs degrees
    // 2pi radians = 360 degrees
    // 1 radian = 360/2pi degrees
    const h = angle_of_point(p) * (360 / TAU)

    // the points are bounded by the radius of the unit circle (1)
    // but d3 needs [0, 230]
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch
    // mdn uses 230 as max
    // https://css.land/lch/ uses 132 as max
    // by experimentation 70 matches the paper the best
    const c = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * MAX_CHROMA;

    const color = d3.hcl(h, c, LIGHTNESS);
    colors.push(color.rgb().clamp())
  }
  return colors
}
