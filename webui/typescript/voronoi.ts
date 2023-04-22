import { Delaunay } from "d3-delaunay"
import { party_manager } from "./cache";
import { clear_canvas } from "./canvas";
import { CANVAS_SIDE } from "./constants";
import { AllCanvases } from "./types/canvas";

export function disable_voronoi(all_canvases: AllCanvases): void {
  if (all_canvases.voter.elem.style.display === 'none') {
    all_canvases.simulation.elem.style.filter = ''
  }
  all_canvases.voronoi.elem.style.display = 'none'
  clear_canvas(all_canvases.voronoi.ctx)
}

export function plot_voronoi(ctx: CanvasRenderingContext2D): void {
  const parties: Array<d3.Delaunay.Point> = party_manager.parties
    .map(p => [p.x_pct * CANVAS_SIDE, p.y_pct * CANVAS_SIDE])

  const delaunay = Delaunay.from(parties)
  const voronoi = delaunay.voronoi()
  clear_canvas(ctx)
  ctx.beginPath()
  voronoi.render(ctx)
  ctx.stroke()
}

export function voronoi_enabled(): boolean {
  const checkbox = document.getElementById('show_voronoi') as HTMLInputElement
  return checkbox.checked
}
