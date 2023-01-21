import { pointer_pct_to_grid } from "../../../convert_locations"
import { parties_from_table } from "../../../form"
import { clear_party_seats_td } from "../../../party_table/delete_party"
import { PercentageCoords } from "../../../types"

export function update_party_table(
  pct: PercentageCoords,
  drag_target_num: number
): void {
  parties_from_table().forEach(tr => {
    const num_str = tr.children[1] as HTMLInputElement
    if (parseInt(num_str.innerText) === drag_target_num) {
      const { grid_x, grid_y } = pointer_pct_to_grid(pct)
      tr.children[3]!.innerHTML = grid_x.toFixed(2)
      tr.children[4]!.innerHTML = grid_y.toFixed(2)
    }
    clear_party_seats_td(tr)
  })
}

