import { hcl, hsluv } from "../blended_cmaps/colors";
import { add_preplot_canvas } from "../cache";
import { CANVAS_SIDE, MAX_CHROMA, ORIGIN } from "../constants";

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
  ) => void
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.id = 'color-wheel'
  canvas.className = 'overlaid-canvas display-none'
  canvas.width = CANVAS_SIDE
  canvas.height = CANVAS_SIDE
  const ctx = canvas.getContext('2d')!
  func(ctx, MAX_CHROMA, ORIGIN)
  return canvas
}

function plot_colormap_nd_color_wheel(
  ctx: CanvasRenderingContext2D,
  max_radius: number,
  origin: number,
): void {
  return plot_color_wheel(
    ctx, max_radius, origin,
    (a, radius) => hcl(a, radius).toString()
  )
}

function plot_hsluv_color_wheel(
  ctx: CanvasRenderingContext2D,
  max_radius: number,
  origin: number,
): void {
  return plot_color_wheel(
    ctx, max_radius, origin,
    (a, radius) => hsluv(a, radius).toString()
  )
}

// Adapted from https://observablehq.com/@danburzo/color-ramp#disc
// Faster than the old one despite iterating through every single pixel in canvas
// As the old one uses complicated transforms
function plot_color_wheel(
  ctx: CanvasRenderingContext2D,
  max_radius: number,
  origin: number,
  make_color: (angle: number, radius: number) => string
): void {
  // Iterate over every pixel in canvas
  for (let x = 0; x < CANVAS_SIDE; x++) {
    for (let y = 0; y < CANVAS_SIDE; y++) {
      // The distance from the current pixel to the canvas center
      const px = origin - x
      const py = origin - y
      const r = Math.sqrt(px ** 2 + py ** 2)
      // If the distance is within the radius we want, draw a pixel
      if (r <= max_radius) {
        const a = Math.atan2(py, px)
        ctx.fillStyle = make_color(a / Math.PI * 180, r)
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }
}
