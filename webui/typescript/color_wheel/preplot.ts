import * as d3 from "d3-color"
import { MAX_RADIUS, ORIGIN, RADIUS_STEP } from "./constants";

export function preplot(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.id = 'color-wheel'
  canvas.className = 'overlaid-canvas display-none'
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')!
  plot_color_wheel(ctx, MAX_RADIUS, ORIGIN, RADIUS_STEP)
  return canvas
}

function plot_color_wheel(
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
    const gap = Math.floor(radius / 100 * 7) + 1

    for (let a = 360; a > 0; a--) {
      ctx.setTransform(1, 0, 0, 1, origin, origin)
      ctx.rotate(-a / 180 * Math.PI)
      const color = d3.hcl(a, radius, 55)
      ctx.fillStyle = color.rgb().clamp().toString()
      ctx.fillRect(inner_radius, 0, outer_radius - inner_radius, gap)
    }
  }

  ctx.setTransform(original_transform)
}

