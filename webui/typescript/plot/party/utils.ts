import { clear_canvas } from "../../canvas"
import { AllCanvases, Canvas } from "../../types/canvas"

export function hide_voter_canvas(
  all_canvases: AllCanvases,
  canvas_to_clear: Canvas
): void {
  if (all_canvases.voronoi.elem.style.display !== 'initial') {
    all_canvases.simulation.elem.style.filter = ''
  }
  canvas_to_clear.elem.style.display = 'none'
  clear_canvas(canvas_to_clear.ctx)
}
