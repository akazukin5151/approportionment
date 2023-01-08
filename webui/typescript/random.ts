export function random_between(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function round_1dp(n: number): number {
  return Math.round(n * 10) / 10
}

export function random_color(): number {
  return Math.round(random_between(0, 0xffffff))
}

export function random_int(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
