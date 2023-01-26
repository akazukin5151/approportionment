import { Delaunay } from "d3-delaunay"
import { clear_canvas } from "../../canvas"
import { CANVAS_SIDE, TAU } from "../../constants"
import { grid_x_to_pct, grid_y_to_pct } from "../../convert_locations"
import { Canvas, SimulationResult, XY } from "../../types/core"
import { load_party } from "../../form"

export function plot_voter_canvas(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  point: SimulationResult,
  party_trs: Array<Element>,
): void {
  const form = document.getElementById('myform')
  const fd = new FormData(form as HTMLFormElement)
  const voter_scatter = fd.get('use_voters_sample') === 'on'
  const show_voronoi = fd.get('show_voronoi') === 'on'
  if (show_voronoi || point.voters_sample) {
    simulation_canvas.elem.style.filter = 'opacity(.2)'
    voter_canvas.elem.style.display = 'initial'
    clear_canvas(voter_canvas.ctx)
  }
  if (voter_scatter && point.voters_sample) {
    plot_voters(voter_canvas, point.voters_sample)
  }
  if (show_voronoi) {
    plot_voronoi(party_trs, voter_canvas.ctx)
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

function plot_voronoi(
  party_trs: Array<Element>,
  ctx: CanvasRenderingContext2D
): void {
  const parties: Array<d3.Delaunay.Point> = party_trs
    .map(load_party)
    .map(p => [p.x_pct * CANVAS_SIDE, p.y_pct * CANVAS_SIDE])

  const delaunay = Delaunay.from(parties)
  const voronoi = delaunay.voronoi()
  ctx.beginPath()
  voronoi.render(ctx)
  ctx.stroke()
}

