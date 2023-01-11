import { PartyPlotBoundary } from "../../boundary";
import { Party, PartyPlotInfo, Rgb } from "../../types";

export type XY = { grid_x: number; grid_y: number; }

function color_to_rgb(color: string): Rgb {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5), 16)
  return { r, g, b }
}

export function party_to_ppi(p: Party): PartyPlotInfo {
  return {
    boundaries: new PartyPlotBoundary(p.x_pct, p.y_pct),
    color: color_to_rgb(p.color),
    num: p.num,
  }
}

/** Converts pointer hover position to a percentage of the target element **/
export function pointer_to_pct(
  target: HTMLElement,
  e: MouseEvent
): XY {
  const max_y = target.clientHeight
  const max_x = target.clientWidth
  const norm_x = e.offsetX / max_x
  const norm_y = e.offsetY / max_y
  return { grid_x: norm_x, grid_y: norm_y }
}

/** Converts percentage of a canvas to grid coordinates **/
export function pointer_pct_to_grid(pct: XY): XY {
  const grid_x = pct.grid_x * 2 - 1
  const grid_y = -1 * ((pct.grid_y) * 2 - 1)
  return { grid_x: grid_x, grid_y: grid_y }
}

