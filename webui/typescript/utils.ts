export function color_str_to_num(hex: string): number {
  return parseInt(hex.slice(1), 16)
}

export function color_num_to_string(hex: number): string {
  return '#' + hex.toString(16)
}

export function x_scale(coord_x: number) {
  const percentage = (coord_x + 1) / 2
  return 500 * percentage
}

export function y_scale(coord_y: number) {
  const percentage = (coord_y + 1) / 2
  return 500 * (1 - percentage)
}

export function unscale_x(canvas_x: number) {
  const percentage = canvas_x / 500
  return percentage * 2 - 1
}

export function unscale_y(canvas_y: number) {
  const percentage = canvas_y / 500
  return (1 - percentage) * 2 - 1
}

