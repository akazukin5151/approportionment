import { pointer_pct_to_grid, pointer_to_pct } from "../convert_locations"
import { GridCoords } from "../types/xy"
import { find_hovered_party } from "./hovered_party"

export function on_pointer_move(evt: Event, party_coords: Array<GridCoords>): void {
  const e = evt as MouseEvent
  const pointer_coords = pointer_pct_to_grid(pointer_to_pct(e))
  const hover = find_hovered_party(pointer_coords, party_coords)
  if (hover !== null) {
    document.body.style.cursor = 'grab'
  } else {
    document.body.style.cursor = 'auto'
  }
}
