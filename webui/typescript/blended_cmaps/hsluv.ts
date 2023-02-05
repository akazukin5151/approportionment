import * as d3 from 'd3-color'
import { Hsluv } from 'hsluv';
import { angle_of_point } from "../colormap_nd/angle";
import { TAU } from "../constants";
import { Rgb } from "../types/core";
import { GridCoords } from "../types/position";

export function map_to_hsluv(seats: Array<GridCoords>): Array<Rgb> {
  const colors = []
  for (const p of seats) {
    const color = new Hsluv()
    color.hsluv_l = 55

    // needs degrees
    // 2pi radians = 360 degrees
    // 1 radian = 360/2pi degrees
    color.hsluv_h = angle_of_point(p) * (360 / TAU)

    // saturation is a percentage from origin to bounding line
    color.hsluv_s = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * 100;

    color.hsluvToRgb()
    colors.push(d3.rgb(color.rgb_r * 255, color.rgb_g * 255, color.rgb_b * 255))
  }
  return colors
}

