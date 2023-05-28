import { clear_canvas } from "../../canvas"
import { ORIGIN , MAX_CHROMA, TAU } from "../../constants"
import { AppCache } from "../../types/cache"

const DOT_RADIUS = 4

export function highlight_colorwheel(cache: AppCache, hover_point_idx: number): void {
  const seat_coord = cache.legend.radviz!.seat_coords[hover_point_idx]
  if (seat_coord) {
    const canvas = document.getElementById('color-wheel-hover') as HTMLCanvasElement
    canvas.style.display = 'initial'
    const ctx = canvas.getContext('2d')!
    const x = MAX_CHROMA * seat_coord.grid_x
    const y = MAX_CHROMA * seat_coord.grid_y

    clear_canvas(ctx, false)
    ctx.fillStyle = '#00ff00'
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.arc(ORIGIN + x, ORIGIN - y, DOT_RADIUS, 0, TAU, true)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
}
