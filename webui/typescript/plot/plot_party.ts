import * as PIXI from 'pixi.js'
import { InfoGraphics, Party, PartyPlotBoundary, Rgb } from "../types";
import { load_parties } from '../load_parties'
import { color_num_to_string, x_pct, y_pct } from '../utils';
import { norm_pointer_to_grid, on_pointer_move } from '../setup/hover'

export function plot_party_core(stage: PIXI.Container, parties: Array<Party>): void {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')!
  // match the resolution of the points
  const image_data = ctx.createImageData(200, 200)

  const radius = 0.05
  const ps: Array<PartyPlotBoundary & { color: Rgb }> =
    parties.map(p => {
      const color = color_num_to_string(p.color)
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5), 16)

      const desired_row_min = Math.max(p.y - radius, 0)
      const desired_row_max = p.y + radius
      const desired_col_min = Math.max(p.x - radius, 0)
      const desired_col_max = p.x + radius

      const min_col = Math.floor(desired_col_min * 200 * 4)
      const max_col = Math.floor(desired_col_max * 200 * 4)
      const min_row = Math.floor(desired_row_min * 200)
      const max_row = Math.floor(desired_row_max * 200)

      const min_col_rounded = min_col - (min_col % 4)
      const max_col_rounded = max_col - (max_col % 4)

      return {
        color: { r, g, b },
        min_row, max_row, min_col_rounded, max_col_rounded
      }
    })

  const plt = new CanvasPlotter(200, 200)
  ps.forEach(p => {
    const color = p.color
    for (let col = p.min_col_rounded; col < p.max_col_rounded; col += 4) {
      for (let row = p.min_row; row < p.max_row; row++) {
        plt.plot_pixel(image_data, row, col, color)
      }
    }
  })

  canvas.addEventListener('mousemove', on_pointer_move)
  canvas.addEventListener('mousedown', e => on_drag_start(ps, e))

  ctx.putImageData(image_data, 0, 0)
  const div = document.createElement('div')
  div.appendChild(canvas)
  div.style.margin = '10px'
  document.body.appendChild(div)

  parties.forEach(p => plot_single_party(stage, p.num, p.color, p.x, p.y))
}

class CanvasPlotter {
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
    color: Rgb
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
    image_data.data[first_idx_of_pixel + 3] = 255
    return { error: null }
  }

  demo(image_data: ImageData) {
    const black = { r: 0, g: 0, b: 0 }

    for (let col = this.first_col; col < 80; col += 4) {
      this.plot_pixel(image_data, this.first_row, col, black)
    }

    for (let col = this.cols_in_canvas - 80; col < this.cols_in_canvas; col += 4) {
      this.plot_pixel(image_data, this.first_row, col, black)
    }

    for (let row = this.first_row; row < 20; row++) {
      this.plot_pixel(image_data, row, this.first_col, black)
    }

    for (let row = this.last_row - 20; row < this.last_row; row++) {
      this.plot_pixel(image_data, row, this.first_col, black)
    }

    for (let row = this.first_row; row < 20; row++) {
      this.plot_pixel(image_data, row, this.last_col, black)
    }

    for (let row = this.last_row - 20; row < this.last_row; row++) {
      this.plot_pixel(image_data, row + 1, this.last_col, black)
    }

    for (let col = this.first_col; col < 80; col += 4) {
      this.plot_pixel(image_data, this.last_row, col, black)
    }

    for (let col = this.cols_in_canvas - 80; col < this.cols_in_canvas; col += 4) {
      this.plot_pixel(image_data, this.last_row, col, black)
    }

  }

}

function on_drag_start(boundaries: Array<PartyPlotBoundary>, event: MouseEvent) {
  const l = (e: Event) => on_drag_move(boundaries, e)
  event.target!.addEventListener('mousemove', l)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', l)
  })
}

function on_drag_move(boundaries: Array<PartyPlotBoundary>, event: Event) {
  const evt = event as MouseEvent
  const normed = norm_pointer_to_grid(evt.target as HTMLElement, evt)
  const b = boundaries.find(boundary => {
    const min_row = boundary.min_row / 200
    const max_row = boundary.max_row / 200
    const min_col = boundary.min_col_rounded / 200 / 4
    const max_col = boundary.max_col_rounded / 200 / 4
    return normed.y >= min_row && normed.y <= max_row
      && normed.x >= min_col && normed.x <= max_col
  })
  if (b) {
    console.log(b)
  }
}

export function plot_single_party(
  stage: PIXI.Container,
  num: number,
  color: number,
  x: number,
  y: number
): void {
  const infographics = new InfoGraphics({ num, color });
  infographics.lineStyle(2, 0xffffff, 1);
  infographics.beginFill(color, 1);
  infographics.drawCircle(0, 0, 20);
  infographics.endFill();
  infographics.interactive = true
  infographics.cursor = 'pointer'
  //infographics.on('pointerdown', on_drag_start, infographics);
  infographics.position = { x, y }
  infographics.zIndex = 1
  stage.addChild(infographics);
}

export function plot_default(stage: PIXI.Container): void {
  const parties = load_parties(stage);

  const p = parties
    .map(({ x, y, color, num }) => ({ x: x_pct(x), y: y_pct(y), color, num }));

  plot_party_core(stage, p)
}
