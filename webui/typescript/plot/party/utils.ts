export type XY = { grid_x: number; grid_y: number; }

export type PercentageCoords = { x_pct: number, y_pct: number }

/** Converts pointer hover position to a percentage of the target element **/
export function pointer_to_pct(
  target: HTMLElement,
  e: MouseEvent
): PercentageCoords {
  const max_y = target.clientHeight
  const max_x = target.clientWidth
  const norm_x = e.offsetX / max_x
  const norm_y = e.offsetY / max_y
  return { x_pct: norm_x, y_pct: norm_y }
}

/** Converts percentage of a canvas to grid coordinates **/
export function pointer_pct_to_grid(pct: PercentageCoords): XY {
  const grid_x = pct.x_pct * 2 - 1
  const grid_y = -1 * ((pct.y_pct) * 2 - 1)
  return { grid_x: grid_x, grid_y: grid_y }
}

