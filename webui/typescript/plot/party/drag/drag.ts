import { PercentageCoord, PartyPlotInfo } from "../../../types";
import { norm_pointer_to_grid } from '../hover'
import { ppi } from '../plot_party'
import { Canvas } from "../../../canvas";
import { PartyPlotBoundary } from "../../../boundary";
import { find_party_within, update_drag_boundary, update_party_table } from "./utils";

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
    clear_old_pixels(dragged, canvas)
    fill_new_pixels(boundary, dragged, canvas)
    update_drag_boundary(boundary, dragged)
    update_party_table(normed, dragged)
    canvas.putImageData()
  }
}

function clear_old_pixels(
  dragged_info: PartyPlotInfo,
  canvas: Canvas
) {
  const doesnt_matter = { r: 255, g: 255, b: 255 }
  for (let { col, row } of dragged_info.boundaries.pixels()) {
    const another = find_party_within(row, col, dragged_info, ppi)
    if (another) {
      // if there is another, fill with their color instead
      // TODO: still buggy
      canvas.plot_pixel(row, col, another.color)
    } else {
      canvas.plot_pixel(row, col, doesnt_matter, 0)
    }
  }
}

function fill_new_pixels(
  boundary: PartyPlotBoundary,
  dragged_info: PartyPlotInfo,
  canvas: Canvas
) {
  for (let { col, row } of boundary.pixels()) {
    const another = find_party_within(row, col, dragged_info, ppi)
    if (!another) {
      canvas.plot_pixel(row, col, dragged_info.color)
    }
  }
}

