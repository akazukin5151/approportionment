import { GridCoords } from "../types/xy"

/** The approximate radius of a party dot on the color wheel, in terms of
 * grid units **/
const GRID_RADIUS = 0.4

export function find_hovered_party(
  pointer: GridCoords,
  party_coords: Array<GridCoords>
): number | null {
  return party_coords
    .map((x, i) => ({ x, i }))
    .find(({ x: coord }) => {
      const dist = Math.sqrt(
        (pointer.grid_x - coord.grid_x) ** 2
        + (pointer.grid_y - coord.grid_y) ** 2
      )
      return dist <= GRID_RADIUS
    })
    ?.i
    ?? null
}
