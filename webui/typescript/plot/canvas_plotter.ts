import { Rgb } from "../types";

export class CanvasPlotter {
  protected readonly rows_in_data: number;
  protected readonly cols_in_data: number;
  readonly cols_in_canvas: number;
  readonly last_row: number;
  readonly last_col: number;
  readonly first_row = 0;
  readonly first_col = 0;

  constructor(rows_in_data: number, cols_in_data: number) {
    this.rows_in_data = rows_in_data
    this.cols_in_data = cols_in_data
    this.cols_in_canvas = cols_in_data * 4
    this.last_row = rows_in_data - 1
    this.last_col = this.cols_in_canvas - 4
  }

  // row_index is a 0-based number from 0=..<number of rows in the canvas
  // col_index is a 0-based number from 0=..=number of columns in the canvas - 4
  // number of columns in the canvas = number of columns in the data * 4
  // multiply by 4 for each of the 4 RGBA values
  // subtract 4 as the last color value must fit in the last 4 slots
  plot_pixel(
    this: CanvasPlotter,
    image_data: ImageData,
    row_index: number,
    col_index: number,
    color: Rgb,
    alpha: number = 255
  ): { error: string | null } {
    if (row_index < 0) {
      return { error: 'row_number cannot be less than 0' }
    } else if (row_index >= this.rows_in_data) {
      return { error: 'row_number cannot be equal or larger than rows in data' }
    } else if (col_index < 0) {
      return { error: 'col_index cannot be less than 0' }
    } else if (col_index > this.cols_in_canvas) {
      return { error: 'col_index cannot be larger than the 4 * columns in data' }
    } else if (col_index > this.last_col) {
      return { error: 'col_index cannot be larger than 4 * columns in data - 4' }
    }

    // n=1 | 0 -- 799
    // n=2 | 800 -- 800*2 - 1
    // n=3 | 800*2 -- 800*3 - 1
    // n   | 800*(n-1) -- 800*n - 1
    const first_idx_of_row = this.cols_in_canvas * row_index
    const first_idx_of_pixel = first_idx_of_row + col_index
    image_data.data[first_idx_of_pixel + 0] = color.r
    image_data.data[first_idx_of_pixel + 1] = color.g
    image_data.data[first_idx_of_pixel + 2] = color.b
    image_data.data[first_idx_of_pixel + 3] = alpha
    return { error: null }
  }

}
