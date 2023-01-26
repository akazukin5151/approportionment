import { Delaunay } from "d3-delaunay"
import { clear_canvas } from "../canvas";
import { CANVAS_SIDE } from "../constants";
import { load_party, parties_from_table } from "../form";
import { AllCanvases } from "../types/app";

export function setup_voronoi(all_canvases: AllCanvases): void {
  const { simulation, voronoi } = all_canvases
  const checkbox = document.getElementById('show_voronoi') as HTMLInputElement
  checkbox.addEventListener('click', () => {
    if (checkbox.checked) {
      if (simulation.elem.style.filter === '') {
        simulation.elem.style.filter = 'opacity(.2)'
      }
      voronoi.elem.style.display = 'initial'
      clear_canvas(voronoi.ctx)
      plot_voronoi(voronoi.ctx)
    } else {
      if (all_canvases.voter.elem.style.display === 'none') {
        all_canvases.simulation.elem.style.filter = ''
      }
      voronoi.elem.style.display = 'none'
      clear_canvas(voronoi.ctx)
    }
  })
}

function plot_voronoi(ctx: CanvasRenderingContext2D): void {
  const parties: Array<d3.Delaunay.Point> = parties_from_table()
    .map(load_party)
    .map(p => [p.x_pct * CANVAS_SIDE, p.y_pct * CANVAS_SIDE])

  const delaunay = Delaunay.from(parties)
  const voronoi = delaunay.voronoi()
  ctx.beginPath()
  voronoi.render(ctx)
  ctx.stroke()
}
