import { Canvas, Party } from "../../../types";
import { update_party_table } from "./form";
import { find_hovered_party } from "../../hover/hovered_party"
import { load_parties } from "../../../form";
import { clear_canvas } from "../../../canvas";
import { clear_coalition_seats, get_canvas_dimensions } from "../../../form";
import { set_party_changed } from "../../../cache";
import { pointer_pct_to_grid, pointer_to_pct } from "../../../convert_locations";

let dragging: Party | null = null

export function on_drag_start(
  canvas: Canvas,
  event: Event,
  plotter: (canvas: Canvas, party: Party) => void
): void {
  const l = (e: Event): void => on_drag_move(canvas, e, plotter)
  event.target!.addEventListener('mousemove', l)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', l)
    dragging = null
    if (document.body.style.cursor === 'grabbing') {
      document.body.style.cursor = 'grab'
    }
  })
}

function on_drag_move(
  canvas: Canvas,
  event: Event,
  plotter: (canvas: Canvas, party: Party) => void
): void {
  const evt = event as MouseEvent
  const canvas_dimensions = get_canvas_dimensions()
  const { x_pct, y_pct } = pointer_to_pct(evt.target as HTMLElement, evt)
  if (!dragging) {
    dragging = find_hovered_party(evt.offsetX, evt.offsetY, canvas_dimensions)
  }

  if (dragging) {
    document.body.style.cursor = 'grabbing'
    const { grid_x, grid_y } = pointer_pct_to_grid({ x_pct, y_pct })
    dragging = { ...dragging, x_pct, y_pct, grid_x, grid_y }
    clear_canvas(canvas.ctx)
    load_parties().forEach(party => plotter(canvas, party))
    update_party_table(pointer_to_pct(evt.target as HTMLElement, evt), dragging.num)
    clear_coalition_seats()
    set_party_changed(true)
  }

}
