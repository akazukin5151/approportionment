import { pointer_pct_to_grid } from "../../../convert_locations"
import { parties_from_table } from "../../../form"
import { clear_party_seats_td } from "../../../td"
import { PercentageCoords } from "../../../types/position"

export function update_party_table(
  pct: PercentageCoords,
  drag_target_num: number
): void {
  parties_from_table().forEach(tr => {
    const num_str = tr.children[0] as HTMLInputElement
    if (parseInt(num_str.innerText) === drag_target_num) {
      const { grid_x, grid_y } = pointer_pct_to_grid(pct);
      (tr.children[2]!.children[0] as HTMLInputElement).value = grid_x.toFixed(2);
      (tr.children[3]!.children[0] as HTMLInputElement).value = grid_y.toFixed(2);
    }
    clear_party_seats_td(tr)
  })
}

