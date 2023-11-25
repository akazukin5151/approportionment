import { clear_canvas } from "../../canvas"
import { AllCanvases } from "../../types/canvas"

export function hide_voter_canvas(
  all_canvases: AllCanvases,
): void {
  if (all_canvases.voronoi.elem.style.display !== 'initial') {
    all_canvases.simulation.elem.style.filter = ''
  }
  all_canvases.voter.elem.style.display = 'none'
  clear_canvas(all_canvases.voter.ctx, false)
}
