import { Canvas, Party, PartyPlotInfo, Rgb } from "../types";
import { load_parties } from '../load_parties'
import { norm_pointer_to_grid, on_pointer_move, scale_pointer_to_grid } from '../setup/hover'

let ppi: Array<PartyPlotInfo> = []

export function plot_party_core(canvas: Canvas, parties: Array<Party>): void {
  for (let i = 0; i < canvas.image_data.data.length; i += 4) {
    canvas.image_data.data[i + 4] = 0
  }

  const radius = 0.05
  ppi =
    parties.map(p => {
      const color = p.color
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5), 16)

      const desired_row_min = Math.max(p.y_pct - radius, 0)
      const desired_row_max = p.y_pct + radius
      const desired_col_min = Math.max(p.x_pct - radius, 0)
      const desired_col_max = p.x_pct + radius

      const min_col = Math.floor(desired_col_min * 200 * 4)
      const max_col = Math.floor(desired_col_max * 200 * 4)
      const min_row = Math.floor(desired_row_min * 200)
      const max_row = Math.floor(desired_row_max * 200)

      const min_col_rounded = min_col - (min_col % 4)
      const max_col_rounded = max_col - (max_col % 4)

      return {
        color: { r, g, b },
        num: p.num,
        min_row, max_row, min_col_rounded, max_col_rounded
      }
    })

  const plt = new CanvasPlotter(200, 200)
  ppi.forEach(p => {
    const color = p.color
    for (let col = p.min_col_rounded; col < p.max_col_rounded; col += 4) {
      for (let row = p.min_row; row < p.max_row; row++) {
        plt.plot_pixel(canvas.image_data, row, col, color)
      }
    }
  })

  canvas.elem.addEventListener('mousemove', on_pointer_move)
  canvas.elem.addEventListener('mousedown', e => on_drag_start(canvas, e))

  canvas.ctx.putImageData(canvas.image_data, 0, 0)
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

let dragged: PartyPlotInfo | null = null

function on_drag_start(
  canvas: Canvas,
  event: Event
) {
  const l = (e: Event) => on_drag_move(canvas, e)
  event.target!.addEventListener('mousemove', l)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', l)
    dragged = null
  })
}

function on_drag_move(
  canvas: Canvas,
  event: Event
) {
  const evt = event as MouseEvent
  const normed = norm_pointer_to_grid(evt.target as HTMLElement, evt)
  if (!dragged) {
    dragged = ppi.find(info => {
      const min_row = info.min_row / 200
      const max_row = info.max_row / 200
      const min_col = info.min_col_rounded / 200 / 4
      const max_col = info.max_col_rounded / 200 / 4
      return normed.y >= min_row && normed.y <= max_row
        && normed.x >= min_col && normed.x <= max_col
    }) || null
  }

  if (dragged) {
    const plt = new CanvasPlotter(200, 200)

    // clear the old position
    const white = { r: 255, g: 255, b: 255 }
    for (let col = dragged.min_col_rounded; col < dragged.max_col_rounded; col += 4) {
      for (let row = dragged.min_row; row < dragged.max_row; row++) {
        const another = ppi.filter(b => b !== dragged).find(b =>
          col >= b.min_col_rounded && col <= b.max_col_rounded
          && row >= b.min_row && row <= b.max_row
        )
        if (another) {
          // if there is another, fill with their color instead
          // TODO: still buggy
          plt.plot_pixel(canvas.image_data, row, col, another.color)
        } else {
          plt.plot_pixel(canvas.image_data, row, col, white, 0)
        }
      }
    }

    // fill in the new position
    const color = dragged.color
    const radius = 0.05
    const nx = normed.x
    const ny = normed.y

    const desired_row_min = Math.max(ny - radius, 0)
    const desired_row_max = ny + radius
    const desired_col_min = Math.max(nx - radius, 0)
    const desired_col_max = nx + radius

    const min_col = Math.floor(desired_col_min * 200 * 4)
    const max_col = Math.floor(desired_col_max * 200 * 4)
    const min_row = Math.floor(desired_row_min * 200)
    const max_row = Math.floor(desired_row_max * 200)

    const min_col_rounded = min_col - (min_col % 4)
    const max_col_rounded = max_col - (max_col % 4)

    for (let col = min_col_rounded; col < max_col_rounded; col += 4) {
      for (let row = min_row; row < max_row; row++) {
        const another = ppi.filter(b => b !== dragged).find(b =>
          col >= b.min_col_rounded && col <= b.max_col_rounded
          && row >= b.min_row && row <= b.max_row
        )
        if (!another) {
          plt.plot_pixel(canvas.image_data, row, col, color)
        }
      }
    }

    dragged.max_row = max_row
    dragged.min_row = min_row
    dragged.min_col_rounded = min_col_rounded
    dragged.max_col_rounded = max_col_rounded

    const table = document.getElementById('party-table')
    const tbody = table?.children[0]
    if (!tbody) { return }
    Array.from(tbody.children).forEach(tr => {
      const num_str = tr.children[1] as HTMLInputElement
      const drag_target_num: number = dragged!.num
      if (parseInt(num_str.innerText) === drag_target_num) {
        const { x, y } = scale_pointer_to_grid(normed)
        tr.children[3]!.innerHTML = x.toFixed(2)
        tr.children[4]!.innerHTML = y.toFixed(2)
      }
    })

    canvas.ctx.putImageData(canvas.image_data, 0, 0)
  }
}

export function plot_default(canvas: Canvas): void {
  const parties = load_parties();
  plot_party_core(canvas, parties)
}
