import { Party, PartyPlotBoundary, PartyPlotInfo, Rgb } from "../../types";

export const RADIUS = 0.05

export function calc_boundaries(x_pct: number, y_pct: number): PartyPlotBoundary {
  const desired_row_min = Math.max(y_pct - RADIUS, 0)
  const desired_row_max = y_pct + RADIUS
  const desired_col_min = Math.max(x_pct - RADIUS, 0)
  const desired_col_max = x_pct + RADIUS

  const min_col = Math.floor(desired_col_min * 200 * 4)
  const max_col = Math.floor(desired_col_max * 200 * 4)
  const min_row = Math.floor(desired_row_min * 200)
  const max_row = Math.floor(desired_row_max * 200)

  const min_col_rounded = min_col - (min_col % 4)
  const max_col_rounded = max_col - (max_col % 4)

  return {
    min_row, max_row, min_col_rounded, max_col_rounded
  }
}

function color_to_rgb(color: string): Rgb {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5), 16)
  return { r, g, b }
}

export function party_to_ppi(p: Party): PartyPlotInfo {
  return {
    color: color_to_rgb(p.color),
    num: p.num,
    ...calc_boundaries(p.x_pct, p.y_pct)
  }
}
