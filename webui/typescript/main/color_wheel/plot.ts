import { preplot_canvases } from "../cache"
import { clear_canvas } from "../canvas"
import { MAX_CHROMA, TAU, ORIGIN } from "../constants"
import { AppCache, Legend } from "../types/cache"
import { Canvas } from "../types/canvas"
import { plot_parties_on_circumference } from "./plot_parties"

const SEAT_RADIUS = 2

function init_colorwheel_canvas(id: string): Canvas {
  const elem = document.getElementById(id) as HTMLCanvasElement
  elem.style.display = 'initial'
  const ctx = elem.getContext('2d')!
  return { elem, ctx }
}

export function plot_on_colorwheel(cmap_name: string): void {
  const canvas = preplot_canvases.get(cmap_name)
  if (canvas) {
    const container = document.getElementById('color-wheel-container')
    const div = container?.children[0] as HTMLElement
    canvas.style.display = 'initial'
    const first = div.children[0]!
    if (first.id === 'color-wheel') {
      div.replaceChild(canvas, first)
    } else {
      div.prepend(canvas)
    }
  }
}

export function plot_seats_on_wheel(cache: AppCache): CanvasRenderingContext2D {
  const { ctx } = init_colorwheel_canvas('color-wheel-seats')
  clear_canvas(ctx, false)
  plot_mapped_seats(ctx, cache.legend, MAX_CHROMA, ORIGIN)
  return ctx
}

export function plot_party_on_wheel(cache: AppCache): Canvas {
  const canvas = init_colorwheel_canvas('color-wheel-party')
  clear_canvas(canvas.ctx, false)
  plot_parties_on_circumference(canvas.ctx, cache, MAX_CHROMA, ORIGIN)
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
    ctx.arc(origin + x, origin - y, SEAT_RADIUS, 0, TAU, true)
    ctx.closePath()
    ctx.stroke()
  })
}

