export function color_str_to_num(hex: string): number {
  return parseInt(hex.slice(1), 16)
}

export function color_num_to_string(hex: number): string {
  return '#' + hex.toString(16)
}

export function x_scale(coord_x: number): number {
  const percentage = (coord_x + 1) / 2
  return 500 * percentage
}

export function y_scale(coord_y: number): number {
  const percentage = -1 * ((coord_y + 1) / 2 - 1)
  return 500 * percentage
}

export function unscale_x(canvas_x: number): number {
  const percentage = canvas_x / 500
  return percentage * 2 - 1
}

export function unscale_y(canvas_y: number): number {
  const percentage = canvas_y / 500
  // p = -((x + 1) / 2 - 1)
  // -p = (x + 1) / 2 - 1
  // -p + 1 = (x + 1) / 2
  // 2 * (-p + 1) = x + 1
  // x = 2 * (-p + 1) - 1
  // x = -2p + 2 - 1
  // x = -2p + 1
  return -2 * percentage + 1
}

export function x_pct(coord_x: number): number {
  return (coord_x + 1) / 2
}

export function y_pct(coord_y: number): number {
  return -1 * ((coord_y + 1) / 2 - 1)
}

