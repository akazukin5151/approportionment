import { Canvas, PercentageCoord, Party, PartyPlotBoundary, PartyPlotInfo, Rgb } from "../types";
import { load_parties } from '../load_parties'
import { norm_pointer_to_grid, on_pointer_move, scale_pointer_to_grid } from './hover'
import { CanvasPlotter } from "./canvas_plotter";

const RADIUS = 0.05
let ppi: Array<PartyPlotInfo> = []
let dragged: PartyPlotInfo | null = null

function color_to_rgb(color: string): Rgb {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5), 16)
  return { r, g, b }
}

function party_to_ppi(p: Party): PartyPlotInfo {
  return {
    color: color_to_rgb(p.color),
    num: p.num,
    ...calc_boundaries(p.x_pct, p.y_pct)
  }
}

function calc_boundaries(x_pct: number, y_pct: number): PartyPlotBoundary {
  const desired_row_min = Math.max(y_pct - RADIUS, 0)
  const desired_row_max = y_pct + RADIUS
  const desired_col_min = Math.max(x_pct - RADIUS, 0)
  const desired_col_max = x_pct + RADIUS

  const min_col = Math.floor(desired_col_min * 200 * 4)
  const max_col = Math.floor(desired_col_max * 200 * 4)
  const min_row = Math.floor(desired_row_min * 200)
  const max_row = Math.floor(desired_row_max * 200)

  const min_col_rounded = min_col - (min_col % 4)
  const max_col_rounded = max_col - (max_col % 4)

  return {
    min_row, max_row, min_col_rounded, max_col_rounded
  }
}

export function plot_party_core(canvas: Canvas, parties: Array<Party>): void {
  for (let i = 0; i < canvas.image_data.data.length; i += 4) {
    canvas.image_data.data[i + 4] = 0
  }

  // TODO: add white border around party
  ppi = parties.map(party_to_ppi)

  const plt = new CanvasPlotter(200, 200)
  ppi.forEach(p => plt.plot_square(canvas.image_data, p))

  canvas.elem.addEventListener('mousemove', on_pointer_move)
  canvas.elem.addEventListener('mousedown', e => on_drag_start(canvas, e))

  canvas.ctx.putImageData(canvas.image_data, 0, 0)
}

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

function update_current_drag_info(pct: PercentageCoord) {
  dragged = ppi.find(info => {
    const min_row = info.min_row / 200
    const max_row = info.max_row / 200
    const min_col = info.min_col_rounded / 200 / 4
    const max_col = info.max_col_rounded / 200 / 4
    return pct.y >= min_row && pct.y <= max_row
      && pct.x >= min_col && pct.x <= max_col
  }) || null
}

function on_drag_move(
  canvas: Canvas,
  event: Event
) {
  const evt = event as MouseEvent
  const normed = norm_pointer_to_grid(evt.target as HTMLElement, evt)
  if (!dragged) {
    update_current_drag_info(normed)
  }

  if (dragged) {
    const plt = new CanvasPlotter(200, 200)

    // clear the old position
    const white = { r: 255, g: 255, b: 255 }
    for (let { col, row } of plt.pixels(dragged)) {
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

    // fill in the new position
    const boundary = calc_boundaries(normed.x, normed.y)

    for (let { col, row } of plt.pixels(boundary)) {
      const another = ppi.filter(b => b !== dragged).find(b =>
        col >= b.min_col_rounded && col <= b.max_col_rounded
        && row >= b.min_row && row <= b.max_row
      )
      if (!another) {
        plt.plot_pixel(canvas.image_data, row, col, dragged.color)
      }
    }

    // update current drag info
    dragged.max_row = boundary.max_row
    dragged.min_row = boundary.min_row
    dragged.min_col_rounded = boundary.min_col_rounded
    dragged.max_col_rounded = boundary.max_col_rounded

    update_party_table(normed)

    canvas.ctx.putImageData(canvas.image_data, 0, 0)
  }
}

function update_party_table(normed: PercentageCoord) {
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

}

export function plot_default(canvas: Canvas): void {
  const parties = load_parties();
  plot_party_core(canvas, parties)
}
