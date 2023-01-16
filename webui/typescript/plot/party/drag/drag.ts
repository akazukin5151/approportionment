import { Canvas, Party } from "../../../types";
import { update_party_table } from "./utils";
import { find_hovered_party, pointer_pct_to_grid, pointer_to_pct } from "../utils";
import { load_parties } from "../../../load_parties";
import { clear_canvas } from "../../../canvas";
import { clear_coalition_seats, get_canvas_dimensions } from "../../../utils";
import { set_party_changed } from "../../../cache";

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
  if (!dragging) {
    dragging = find_hovered_party(evt)
  }

  if (dragging) {
    document.body.style.cursor = 'grabbing'
    const canvas_dimensions = get_canvas_dimensions()
    dragging.x_pct = evt.offsetX / canvas_dimensions.width
    dragging.y_pct = evt.offsetY / canvas_dimensions.height
    const grid = pointer_pct_to_grid(dragging)
    dragging.grid_x = grid.grid_x
    dragging.grid_y = grid.grid_y
    clear_canvas(canvas)
    load_parties().forEach(party => plotter(canvas, party))
    update_party_table(pointer_to_pct(evt.target as HTMLElement, evt), dragging.num)
    clear_coalition_seats()
    set_party_changed(true)
  }

}
