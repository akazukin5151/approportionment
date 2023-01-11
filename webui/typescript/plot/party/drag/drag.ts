import { PercentageCoord, PartyPlotInfo } from "../../../types";
import { ppi } from '../plot_party'
import { Canvas } from "../../../canvas";
import { PartyPlotBoundary } from "../../../boundary";
import { update_drag_boundary, update_party_table } from "./utils";
import { clear_old_pixels, fill_new_pixels } from "./draw";
import { norm_pointer_to_grid } from "../utils";

let dragged: PartyPlotInfo | null = null

export function on_drag_start(
  canvas: Canvas,
  event: Event
) {
  const l = (e: Event) => on_drag_move(canvas, e)
  event.target!.addEventListener('mousemove', l)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', l)
    dragged = null
  })
}

function update_new_drag_info(pct: PercentageCoord) {
  dragged = ppi.find(info => {
    const min_row = info.boundaries.min_row / 200
    const max_row = info.boundaries.max_row / 200
    const min_col = info.boundaries.min_col_rounded / 200 / 4
    const max_col = info.boundaries.max_col_rounded / 200 / 4
    return pct.y >= min_row && pct.y <= max_row
      && pct.x >= min_col && pct.x <= max_col
  }) || null
}

function on_drag_move(
  canvas: Canvas,
  event: Event
) {
  const evt = event as MouseEvent
  const normed = norm_pointer_to_grid(evt.target as HTMLElement, evt)
  if (!dragged) {
    update_new_drag_info(normed)
  }

  if (dragged) {
    const boundary = new PartyPlotBoundary(normed.x, normed.y)
    clear_old_pixels(canvas, dragged, ppi)
    fill_new_pixels(boundary, canvas, dragged, ppi)
    update_drag_boundary(boundary, dragged)
    update_party_table(normed, dragged)
    canvas.putImageData()
  }
}
