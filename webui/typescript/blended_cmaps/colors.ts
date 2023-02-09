import * as d3 from 'd3-color'
import { Hsluv } from 'hsluv';
import { angle_of_point } from "./angle";
import { LIGHTNESS, MAX_CHROMA, TAU } from "../constants";
import { GridCoords } from "../types/position";

// for hue, d3 needs degrees
// 2pi radians = 360 degrees
// 1 radian = 360/2pi degrees
//
// for chroma:
// the points are bounded by the radius of the unit circle (1)
// but d3 needs [0, 230]
// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch
// mdn uses 230 as max
// https://css.land/lch/ uses 132 as max
// by experimentation 70 matches the paper the best
export function hcl(hue: number, chroma: number): d3.RGBColor {
  const color = d3.hcl(hue, chroma, LIGHTNESS)
  return clamp_chroma(color).rgb()
}

export function hsluv(hue: number, saturation: number): d3.RGBColor {
  const color = new Hsluv()
  color.hsluv_l = LIGHTNESS
  color.hsluv_h = hue
  color.hsluv_s = saturation
  color.hsluvToRgb()
  const c = d3.rgb(color.rgb_r * 255, color.rgb_g * 255, color.rgb_b * 255)
  return c.rgb().clamp()
}

// https://observablehq.com/@danburzo/hcl-chroma-clamping-vs-rgb-clamping
// https://github.com/d3/d3-color/issues/33
function clamp_chroma(c: d3.HCLColor): d3.HCLColor {
  // if the color is displayable, return it directly
  if (c.displayable()) {
    return c
  }

  // try with chroma=0
  const clamped = d3.hcl(c.h, 0, c.l)

  // if not even chroma=0 is displayable
  // fall back to RGB clamping
  if (!clamped.displayable()) {
    return clamped
  }

  // By this time we know chroma=0 is displayable and our current chroma is not.
  // Find the displayable chroma through the bisection method.
  let start = 0
  let end = c.c
  const delta = 0.01

  while (end - start > delta) {
    clamped.c = start + (end - start) / 2
    if (clamped.displayable()) {
      start = clamped.c
    }
    else {
      end = clamped.c
    }
  }

  return clamped
}

export function map_to_hsluv(points: Array<GridCoords>): Array<d3.RGBColor> {
  return points.map(p => {
    const h = angle_of_point(p) * (360 / TAU)
    // saturation is a percentage from origin to bounding line
    const s = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * 100;
    return hsluv(h, s)
  })
}

export function map_to_lch(points: Array<GridCoords>): Array<d3.RGBColor> {
  return points.map(p => {
    const h = angle_of_point(p) * (360 / TAU)
    const c = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * MAX_CHROMA;
    return hcl(h, c)
  })
}

