import { Canvas, Party } from "../../../types";
import { plot_single_party } from '../plot_party'
import { update_party_table } from "./utils";
import { pointer_pct_to_grid, pointer_to_pct } from "../utils";
import { load_parties } from "../../../load_parties";
import { clear_canvas } from "../../../canvas";
import { RADIUS } from "../../../constants";

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
    dragging = parties
      .find(party => {
        const canvas_x = party.x_pct * 500
        const canvas_y = party.y_pct * 500
        const dist = Math.sqrt(
          (pointer_x - canvas_x) ** 2 + (pointer_y - canvas_y) ** 2
        )
        // needs a *2 here for some reason
        return dist <= (RADIUS * 2)
      }) ?? null
  }

  if (dragging) {
    dragging.x_pct = pointer_x / 500
    dragging.y_pct = pointer_y / 500
    const grid = pointer_pct_to_grid(dragging)
    dragging.grid_x = grid.grid_x
    dragging.grid_y = grid.grid_y
    clear_canvas(canvas)
    parties.forEach(party => plot_single_party(canvas, party))
    update_party_table(pointer_to_pct(evt.target as HTMLElement, evt), dragging.num)
  }

}
