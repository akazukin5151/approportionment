export function random_between(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function round_1dp(n: number): number {
  return Math.round(n * 10) / 10
}

export function random_color(): string {
  const r = Math.floor(random_between(0, 255))
  const g = Math.floor(random_between(0, 255))
  const b = Math.floor(random_between(0, 255))
  // this function is only used to add a value for the color picker input,
  // which only accepts hexadecimal colors
  return '#' + r.toString(16) + g.toString(16) + b.toString(16)
}

export function random_int(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

