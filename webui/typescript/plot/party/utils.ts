import { RADIUS } from "../../constants";
import { load_parties } from "../../load_parties";
import { GridCoords, Party } from "../../types";

export type PercentageCoords = { x_pct: number, y_pct: number }

/** Converts pointer hover position to a percentage of the target element **/
export function pointer_to_pct(
  target: HTMLElement,
  e: MouseEvent
): PercentageCoords {
  const max_y = target.clientHeight
  const max_x = target.clientWidth
  const x_pct = e.offsetX / max_x
  const y_pct = e.offsetY / max_y
  return { x_pct, y_pct }
}

/** Converts percentage of a canvas to grid coordinates **/
export function pointer_pct_to_grid(pct: PercentageCoords): GridCoords {
  const grid_x = pct.x_pct * 2 - 1
  // p = -((x + 1) / 2 - 1)
  // -p = (x + 1) / 2 - 1
  // -p + 1 = (x + 1) / 2
  // 2 * (-p + 1) = x + 1
  // x = 2 * (-p + 1) - 1
  // x = -2p + 2 - 1
  // x = -2p + 1
  const grid_y = -2 * pct.y_pct + 1
  return { grid_x, grid_y }
}

export function find_hovered_party(e: MouseEvent): Party | null {
  const pointer_x = e.offsetX
  const pointer_y = e.offsetY
  const parties = load_parties()
  return parties
    .find(party => {
      const canvas_x = party.x_pct * 500
      const canvas_y = party.y_pct * 500
      const dist = Math.sqrt(
        (pointer_x - canvas_x) ** 2 + (pointer_y - canvas_y) ** 2
      )
      // needs a *2 here for some reason
      return dist <= (RADIUS * 2)
    }) ?? null
}
