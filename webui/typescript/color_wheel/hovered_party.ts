import { GridCoords } from "../types"

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
      return dist <= 0.4
    })
    ?.i
    ?? null
}
