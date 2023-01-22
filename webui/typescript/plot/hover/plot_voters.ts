import { clear_canvas } from "../../canvas"
import { CANVAS_SIDE, TAU } from "../../constants"
import { grid_x_to_pct, grid_y_to_pct } from "../../convert_locations"
import { Canvas, SimulationResult } from "../../types/core"

export function plot_voters(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  point: SimulationResult
): void {
  if (!point.voters_sample) {
    return
  }
  simulation_canvas.elem.style.filter = 'opacity(.2)'
  const ctx = voter_canvas.ctx
  clear_canvas(ctx)
  ctx.fillStyle = '#0000007f'
  point.voters_sample.forEach(voter => {
    const pct_x = grid_x_to_pct(voter.x)
    const pct_y = grid_y_to_pct(voter.y)
    const x = pct_x * CANVAS_SIDE
    const y = pct_y * CANVAS_SIDE
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, TAU, true)
    ctx.stroke()
  })
  voter_canvas.elem.style.display = 'initial'
}

