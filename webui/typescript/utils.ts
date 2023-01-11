export function color_num_to_string(hex: number): string {
  return '#' + hex.toString(16)
}

export function x_pct(coord_x: number): number {
  return (coord_x + 1) / 2
}

export function y_pct(coord_y: number): number {
  return -1 * ((coord_y + 1) / 2 - 1)
}

