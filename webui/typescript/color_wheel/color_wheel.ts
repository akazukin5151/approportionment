import { AppCache, Canvas } from "../types/core"
import { plot_on_colorwheel, plot_party_on_wheel, plot_seats_on_wheel } from "./plot"
import { on_drag_start } from "./drag"
import { on_pointer_move } from "./hover"
import { replot_on_drag } from "./replot"

export function plot_color_wheel_legend(
  simulation_canvas: Canvas,
  cache: AppCache
): void {
  init_container()
  plot_on_colorwheel()
  const seat_ctx = plot_seats_on_wheel(cache)
  const canvas = plot_party_on_wheel(cache)
  add_listeners(canvas, cache, seat_ctx, simulation_canvas)
}

function init_container(): void {
  const container = document.getElementById('color-wheel-container')!
  container.style.display = 'initial'
  container.className = 'wh-200'
}

function add_listeners(
  canvas: Canvas,
  cache: AppCache,
  seat_ctx: CanvasRenderingContext2D,
  simulation_canvas: Canvas,
): void {
  canvas.elem.addEventListener(
    'mousemove',
    e => on_pointer_move(e, cache.legend.radviz!.party_coords)
  )

  canvas.elem.addEventListener('mouseleave',
    () => document.body.style.cursor = 'auto'
  )

  canvas.elem.addEventListener(
    'mousedown',
    e => on_drag_start(
      canvas.ctx, e, cache.legend.radviz!.party_coords,
      angle => replot_on_drag(cache, canvas, seat_ctx, simulation_canvas, angle)
    )
  )
}

