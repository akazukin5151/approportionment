import { GridCoords, PercentageCoords } from "./types/xy"

export function grid_x_to_pct(grid_x: number): number {
  return (grid_x + 1) / 2
}

export function grid_y_to_pct(grid_y: number): number {
  return -1 * ((grid_y + 1) / 2 - 1)
}

/** Converts pointer hover position to a percentage of the target element **/
export function pointer_to_pct(e: MouseEvent): PercentageCoords {
  const max_y = (e.target as HTMLElement).clientHeight
  const max_x = (e.target as HTMLElement).clientWidth
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

