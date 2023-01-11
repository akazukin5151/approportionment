import { PartyPlotBoundary } from "../../../boundary"
import { Canvas } from "../../../canvas"
import { is_border } from "../../../canvas_plotter"
import { WHITE } from "../../../constants"
import { PartyPlotInfo } from "../../../types"
import { find_party_within } from "./utils"

export function clear_old_pixels(
  canvas: Canvas,
  dragged_info: PartyPlotInfo,
  ppi: Array<PartyPlotInfo>
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

export function fill_new_pixels(
  boundary: PartyPlotBoundary,
  canvas: Canvas,
  dragged_info: PartyPlotInfo,
  ppi: Array<PartyPlotInfo>
) {
  for (let { col, row } of boundary.pixels()) {
    const another = find_party_within(row, col, dragged_info, ppi)
    const color = is_border(dragged_info, col, row)
      ? WHITE
      : dragged_info.color
    if (!another) {
      canvas.plot_pixel(row, col, color)
    }
  }
}

