import { Rgb } from "./types"

export function grid_x_to_pct(grid_x: number): number {
  return (grid_x + 1) / 2
}

export function grid_y_to_pct(grid_y: number): number {
  return -1 * ((grid_y + 1) / 2 - 1)
}

export function pct_x_to_grid(x_pct: number): number {
  return 2 * x_pct - 1
}

export function pct_y_to_grid(y_pct: number): number {
  // p = -((x + 1) / 2 - 1)
  // -p = (x + 1) / 2 - 1
  // -p + 1 = (x + 1) / 2
  // 2 * (-p + 1) = x + 1
  // x = 2 * (-p + 1) - 1
  // x = -2p + 2 - 1
  // x = -2p + 1
  return -2 * y_pct + 1
}

export function parse_color(color_str: string): Rgb {
  //  0123456
  // '#fae213'
  const r = parseInt(color_str.slice(1, 3), 16)
  const g = parseInt(color_str.slice(3, 5), 16)
  const b = parseInt(color_str.slice(5), 16)
  return { r, g, b }
}

// TODO: generator for parties in party table
