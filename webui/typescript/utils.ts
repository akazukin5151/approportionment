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

export function pop_random_from_array<T>(arr: Array<T>, n_items: number): Array<T> {
  const result = []
  for (let i = 0; i < n_items; i++) {
    const idx_to_remove = random_int(0, arr.length - 1)
    const removed = arr.splice(idx_to_remove, 1)
    if (removed[0]) {
      result.push(removed[0])
    }
  }
  return result
}

export function random_int(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

