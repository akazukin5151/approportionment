import { PartyPlotBoundary } from "../../../boundary"
import { PartyPlotInfo } from "../../../types"
import { PercentageCoords, pointer_pct_to_grid, XY } from "../utils"

/**
 * Looks for a party plotted within row and col, based on their boundaries
 * from dragged_info
 */
export function find_party_within(
  row: number,
  col: number,
  dragged_info: PartyPlotInfo,
  ppi: Array<PartyPlotInfo>
): PartyPlotInfo | null {
  return ppi.filter(b => b !== dragged_info).find(i => {
    const b = i.boundaries
    return col >= b.min_col_rounded && col <= b.max_col_rounded
      && row >= b.min_row && row <= b.max_row
  }) || null
}


export function update_drag_boundary(
  boundary: PartyPlotBoundary,
  dragged_info: PartyPlotInfo
) {
  dragged_info.boundaries.max_row = boundary.max_row
  dragged_info.boundaries.min_row = boundary.min_row
  dragged_info.boundaries.min_col_rounded = boundary.min_col_rounded
  dragged_info.boundaries.max_col_rounded = boundary.max_col_rounded
}

export function update_party_table(pct: PercentageCoords, drag_target_num: number) {
  const table = document.getElementById('party-table')
  const tbody = table?.children[0]
  if (!tbody) { return }
  Array.from(tbody.children).forEach(tr => {
    const num_str = tr.children[1] as HTMLInputElement
    if (parseInt(num_str.innerText) === drag_target_num) {
      const { grid_x, grid_y } = pointer_pct_to_grid(pct)
      tr.children[3]!.innerHTML = grid_x.toFixed(2)
      tr.children[4]!.innerHTML = grid_y.toFixed(2)
    }
  })
}

