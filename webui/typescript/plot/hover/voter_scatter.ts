import { Delaunay } from "d3-delaunay"
import { clear_canvas } from "../../canvas"
import { CANVAS_SIDE, TAU } from "../../constants"
import { grid_x_to_pct, grid_y_to_pct } from "../../convert_locations"
import { load_party } from "../../form"
import { Canvas, SimulationResult } from "../../types/core"

export function plot_voters(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  point: SimulationResult,
  party_trs: Array<Element>
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

  plot_voronoi(party_trs, ctx)
}

function plot_voronoi(
  party_trs: Array<Element>,
  ctx: CanvasRenderingContext2D
): void {
  const parties: Array<d3.Delaunay.Point> = party_trs
    .map(load_party)
    .map(p => [p.x_pct * CANVAS_SIDE, p.y_pct * CANVAS_SIDE])

  const delaunay = Delaunay.from(parties)
  const voronoi = delaunay.voronoi()
  ctx.strokeStyle = 'black'
  voronoi.render(ctx)
  ctx.stroke()
}

