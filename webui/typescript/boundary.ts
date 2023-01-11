export const RADIUS = 0.05

type Pixels = Generator<{ col: number; row: number; }, void, unknown>

export class PartyPlotBoundary {
  min_row: number;
  max_row: number;
  min_col_rounded: number;
  max_col_rounded: number;

  constructor(x_pct: number, y_pct: number) {
    const desired_row_min = Math.max(y_pct - RADIUS, 0)
    const desired_row_max = y_pct + RADIUS
    const desired_col_min = Math.max(x_pct - RADIUS, 0)
    const desired_col_max = x_pct + RADIUS

    const min_col = Math.floor(desired_col_min * 200 * 4)
    const max_col = Math.floor(desired_col_max * 200 * 4)
    this.min_row = Math.floor(desired_row_min * 200)
    this.max_row = Math.floor(desired_row_max * 200)

    this.min_col_rounded = min_col - (min_col % 4)
    this.max_col_rounded = max_col - (max_col % 4)
  }

  // Yields the column and row of every pixel given the PartyPlotInfo
  *pixels(this: PartyPlotBoundary): Pixels {
    for (let col = this.min_col_rounded; col < this.max_col_rounded; col += 4) {
      for (let row = this.min_row; row < this.max_row; row++) {
        yield { col, row }
      }
    }
  }

}
