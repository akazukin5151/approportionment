import { clear_canvas } from "../canvas"
import { AppCache, Canvas } from "../types"
import { MAX_RADIUS, ORIGIN, RADIUS_STEP } from "./constants"
import { plot_color_wheel, plot_mapped_seats } from "./plot"
import { plot_parties_on_circumference } from "./plot_parties"

function init_colorwheel_canvas(id: string): Canvas {
  const elem = document.getElementById(id) as HTMLCanvasElement
  elem.style.display = 'initial'
  const ctx = elem.getContext('2d')!
  return { elem, ctx }
}

export function plot_on_colorwheel(): void {
  const { ctx } = init_colorwheel_canvas('color-wheel')
  plot_color_wheel(ctx, MAX_RADIUS, ORIGIN, RADIUS_STEP)
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