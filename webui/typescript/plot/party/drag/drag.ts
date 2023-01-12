import { Canvas, Party } from "../../../types";
import { plot_single_party } from '../plot_party'
import { update_party_table } from "./utils";
import { pointer_to_pct } from "../utils";
import { load_parties } from "../../../load_parties";
import { pct_x_to_grid, pct_y_to_grid } from "../../../utils";
import { clear_canvas } from "../../../canvas";

let dragging: Party | null = null

export function on_drag_start(
  canvas: Canvas,
  event: Event
) {
  const l = (e: Event) => on_drag_move(canvas, e)
  event.target!.addEventListener('mousemove', l)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', l)
    dragging = null
  })
}

function on_drag_move(
  canvas: Canvas,
  event: Event
) {
  const evt = event as MouseEvent
  const pointer_x = evt.offsetX
  const pointer_y = evt.offsetY

  const parties = load_parties()
  if (!dragging) {
    // TODO: remove fallback to DEFAULT_PARTIES
    dragging = parties
      .find(
        party => {
          return pointer_x <= party.x_pct * 500 + 10
            && pointer_x >= party.x_pct * 500 - 10
            && pointer_y <= party.y_pct * 500 + 10
            && pointer_y >= party.y_pct * 500 - 10
        }
      ) ?? null
  }

  if (dragging) {
    dragging.x_pct = pointer_x / 500
    dragging.y_pct = pointer_y / 500
    dragging.grid_x = pct_x_to_grid(dragging.x_pct)
    dragging.grid_y = pct_y_to_grid(dragging.y_pct)
    clear_canvas(canvas)
    parties.forEach(party => plot_single_party(canvas, party))
    update_party_table(pointer_to_pct(evt.target as HTMLElement, evt), dragging.num)
  }

}
