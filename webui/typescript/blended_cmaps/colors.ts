import * as d3 from 'd3-color'
import { Hsluv } from 'hsluv';
import { angle_of_point } from "./angle";
import { LIGHTNESS, MAX_CHROMA } from "../constants";
import { GridCoords } from "../types/position";
import { rad_to_deg } from '../trig';
import { okhsl_to_srgb } from './okhsl';

/** Hue in degrees and chroma between [0, 230]
 * The colorwheel maps angle to hue and radius to chroma.
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch
 * CSS also uses 230 as max
 * https://css.land/lch/ uses 132 as max **/
export function hcl(hue: number, chroma: number): d3.RGBColor {
  const color = d3.hcl(hue, chroma, LIGHTNESS)
  return clamp_chroma(color).rgb()
}

/** Hue in degrees and saturation as a percentage **/
export function hsluv(hue: number, saturation: number): d3.RGBColor {
  const color = new Hsluv()
  color.hsluv_l = LIGHTNESS
  color.hsluv_h = hue
  color.hsluv_s = saturation
  color.hsluvToRgb()
  const c = d3.rgb(color.rgb_r * 255, color.rgb_g * 255, color.rgb_b * 255)
  return c.rgb().clamp()
}

export function okhsl(angle: number, radius: number, max_radius: number): d3.RGBColor {
  const { r, g, b } = okhsl_to_srgb(angle / 360, radius / max_radius, LIGHTNESS / 100)
  return d3.rgb(r, g, b)
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
    const h = rad_to_deg(angle_of_point(p))
    // saturation is a percentage from origin to bounding line
    const s = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * 100;
    return hsluv(h, s)
  })
}

export function map_to_lch(points: Array<GridCoords>): Array<d3.RGBColor> {
  return points.map(p => {
    const h = rad_to_deg(angle_of_point(p))
    const c = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * MAX_CHROMA;
    return hcl(h, c)
  })
}

export function map_to_okhsl(points: Array<GridCoords>): Array<d3.RGBColor> {
  return points.map(p => {
    const h = rad_to_deg(angle_of_point(p))
    // saturation is a percentage from origin to bounding line
    const s = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * 100;
    return okhsl(h, s, 100)
  })
}

