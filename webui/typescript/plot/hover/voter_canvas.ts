import { clear_canvas } from "../../canvas"
import { CANVAS_SIDE, TAU } from "../../constants"
import { grid_x_to_pct, grid_y_to_pct } from "../../convert_locations"
import { Canvas } from "../../types/canvas"
import { SimulationResult } from "../../types/election"
import { XY } from "../../types/position"

export function plot_voter_canvas(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  point: SimulationResult,
): void {
  const form = document.getElementById('myform')
  const fd = new FormData(form as HTMLFormElement)
  const voter_scatter = fd.get('use_voters_sample') === 'on'
  if (voter_scatter && point.voters_sample) {
    if (simulation_canvas.elem.style.filter === '') {
      simulation_canvas.elem.style.filter = 'opacity(.2)'
    }
    voter_canvas.elem.style.display = 'initial'
    clear_canvas(voter_canvas.ctx)
    plot_voters(voter_canvas, point.voters_sample)
  }
}

function plot_voters(
  voter_canvas: Canvas,
  voters_sample: Array<XY>,
): void {
  const ctx = voter_canvas.ctx
  voters_sample.forEach(voter => {
    const pct_x = grid_x_to_pct(voter.x)
    const pct_y = grid_y_to_pct(voter.y)
    const x = pct_x * CANVAS_SIDE
    const y = pct_y * CANVAS_SIDE
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, TAU, true)
    ctx.stroke()
  })
}
