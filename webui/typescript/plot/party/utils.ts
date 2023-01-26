import { clear_canvas } from "../../canvas"
import { AllCanvases } from "../../types/app"
import { Canvas } from "../../types/core"

export function hide_voter_canvas(
  all_canvases: AllCanvases,
  canvas_to_clear: Canvas
): void {
  if (all_canvases.voronoi.elem.style.display === 'none') {
    all_canvases.simulation.elem.style.filter = ''
  }
  canvas_to_clear.elem.style.display = 'none'
  clear_canvas(canvas_to_clear.ctx)
}
