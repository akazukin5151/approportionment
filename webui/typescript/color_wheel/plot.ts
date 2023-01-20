import { preplot_canvas } from ".."
import { clear_canvas } from "../canvas"
import { AppCache, Canvas , Legend } from "../types"
import { MAX_RADIUS, ORIGIN } from "./constants"
import { plot_parties_on_circumference } from "./plot_parties"

function init_colorwheel_canvas(id: string): Canvas {
  const elem = document.getElementById(id) as HTMLCanvasElement
  elem.style.display = 'initial'
  const ctx = elem.getContext('2d')!
  return { elem, ctx }
}

export function plot_on_colorwheel(): void {
  if (preplot_canvas) {
    const container = document.getElementById('color-wheel-container')
    const div = container?.children[0]
    preplot_canvas.style.display = 'initial'
    div!.prepend(preplot_canvas)
  }
}

export function plot_seats_on_wheel(cache: AppCache): CanvasRenderingContext2D {
  const { ctx } = init_colorwheel_canvas('color-wheel-seats')
  clear_canvas(ctx)
  plot_mapped_seats(ctx, cache.legend, MAX_RADIUS, ORIGIN)
  return ctx
}

export function plot_party_on_wheel(cache: AppCache): Canvas {
  const canvas = init_colorwheel_canvas('color-wheel-party')
  clear_canvas(canvas.ctx)
  plot_parties_on_circumference(canvas.ctx, cache, MAX_RADIUS, ORIGIN)
  return canvas
}

export function plot_mapped_seats(
  ctx: CanvasRenderingContext2D,
  legend: Legend,
  max_radius: number,
  origin: number,
): void {
  ctx.strokeStyle = 'lightgray'
  legend.radviz!.seat_coords.forEach(coord => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    // subtract y because, a large y means higher up, so a lower y coordinate
    ctx.arc(origin + x, origin - y, 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.stroke()
  })
}

