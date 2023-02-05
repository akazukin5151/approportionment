import * as d3 from "d3-color"
import { Hsluv } from "hsluv";
import { add_preplot_canvas } from "../cache";
import { LIGHTNESS, MAX_CHROMA } from "../constants";
import { ORIGIN, RADIUS_STEP } from "./constants";

const MAX_GAP = 8

export function preplot_all(): void {
  // timings show this is around 80-100 ms
  // ideally it would be in a separate worker but it's fast enough
  // the initial plotting and switching colorschemes rapidly has gotten
  // faster so it's already worth it for a one off calculation
  add_preplot_canvas('ColormapND', preplot(plot_colormap_nd_color_wheel))
  add_preplot_canvas('HSLuv', preplot(plot_hsluv_color_wheel))
}

function preplot(
  func: (
    ctx: CanvasRenderingContext2D,
    max_radius: number,
    origin: number,
    radius_step: number
  ) => void
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.id = 'color-wheel'
  canvas.className = 'overlaid-canvas display-none'
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')!
  func(ctx, MAX_CHROMA, ORIGIN, RADIUS_STEP)
  return canvas
}

function plot_colormap_nd_color_wheel(
  ctx: CanvasRenderingContext2D,
  max_radius: number,
  origin: number,
  radius_step: number,
): void {
  const original_transform = ctx.getTransform()

  // https://stackoverflow.com/questions/37286039/creating-rainbow-gradient-createjs
  for (let radius = max_radius; radius > 0; radius -= radius_step) {
    const inner_radius = radius - radius_step
    const outer_radius = radius
    // remap 8-1 to 100-0
    // the range 8 to 1 has 7 possible values
    const gap = Math.floor(radius / 100 * (MAX_GAP - 1)) + 1

    for (let a = 360; a > 0; a--) {
      ctx.setTransform(1, 0, 0, 1, origin, origin)
      ctx.rotate(-a / 180 * Math.PI)
      const color = d3.hcl(a, radius, LIGHTNESS)
      ctx.fillStyle = color.rgb().clamp().toString()
      ctx.fillRect(inner_radius, 0, outer_radius - inner_radius, gap)
    }
  }

  ctx.setTransform(original_transform)
}

function plot_hsluv_color_wheel(
  ctx: CanvasRenderingContext2D,
  max_radius: number,
  origin: number,
  radius_step: number,
): void {
  const original_transform = ctx.getTransform()

  // https://stackoverflow.com/questions/37286039/creating-rainbow-gradient-createjs
  for (let radius = max_radius; radius > 0; radius -= radius_step) {
    const inner_radius = radius - radius_step
    const outer_radius = radius
    // remap 8-1 to 100-0
    // the range 8 to 1 has 7 possible values
    const gap = Math.floor(radius / 100 * (MAX_GAP - 1)) + 1

    for (let a = 360; a > 0; a--) {
      ctx.setTransform(1, 0, 0, 1, origin, origin)
      ctx.rotate(-a / 180 * Math.PI)
      const color = new Hsluv()
      color.hsluv_l = 55
      color.hsluv_h = a
      color.hsluv_s = radius

      color.hsluvToRgb()
      const c = d3.rgb(color.rgb_r * 255, color.rgb_g * 255, color.rgb_b * 255)
      ctx.fillStyle = c.rgb().clamp().toString()
      ctx.fillRect(inner_radius, 0, outer_radius - inner_radius, gap)
    }
  }

  ctx.setTransform(original_transform)
}

