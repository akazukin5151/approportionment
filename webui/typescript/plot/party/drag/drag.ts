import { Party, PartyPlotInfo } from "../../../types";
import { plot_party_core, ppi } from '../plot_party'
import { Canvas } from "../../../canvas";
import { PartyPlotBoundary } from "../../../boundary";
import { update_drag_boundary, update_party_table } from "./utils";
import { clear_old_pixels, fill_new_pixels } from "./draw";
import { pointer_to_pct, XY } from "../utils";
import { load_parties } from "../../../load_parties";

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
    // TODO
    // dragging.grid_x
    // dragging.grid_y
    plot_party_core(canvas, parties)
    update_party_table(pointer_to_pct(evt.target as HTMLElement, evt), dragging.num)
  }

}
