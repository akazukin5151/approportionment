import { Canvas, PercentageCoord, PartyPlotBoundary, PartyPlotInfo } from "../types";
import { norm_pointer_to_grid, scale_pointer_to_grid } from './hover'
import { CanvasPlotter } from "./canvas_plotter";
import { ppi } from './plot_party'
import { calc_boundaries } from "./utils";

let dragged: PartyPlotInfo | null = null

export function on_drag_start(
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

function update_new_drag_info(pct: PercentageCoord) {
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
    update_new_drag_info(normed)
  }

  if (dragged) {
    const plt = new CanvasPlotter(200, 200)
    const boundary = calc_boundaries(normed.x, normed.y)
    clear_old_pixels(plt, dragged, canvas)
    fill_new_pixels(plt, boundary, dragged, canvas)
    update_drag_boundary(boundary, dragged)
    update_party_table(normed)
    canvas.ctx.putImageData(canvas.image_data, 0, 0)
  }
}

function clear_old_pixels(
  plt: CanvasPlotter,
  dragged_info: PartyPlotInfo,
  canvas: Canvas
) {
  const doesnt_matter = { r: 255, g: 255, b: 255 }
  for (let { col, row } of plt.pixels(dragged_info)) {
    const another = ppi.filter(b => b !== dragged_info).find(b =>
      col >= b.min_col_rounded && col <= b.max_col_rounded
      && row >= b.min_row && row <= b.max_row
    )
    if (another) {
      // if there is another, fill with their color instead
      // TODO: still buggy
      plt.plot_pixel(canvas.image_data, row, col, another.color)
    } else {
      plt.plot_pixel(canvas.image_data, row, col, doesnt_matter, 0)
    }
  }
}

function fill_new_pixels(
  plt: CanvasPlotter,
  boundary: PartyPlotBoundary,
  dragged_info: PartyPlotInfo,
  canvas: Canvas
) {
  for (let { col, row } of plt.pixels(boundary)) {
    const another = ppi.filter(b => b !== dragged_info).find(b =>
      col >= b.min_col_rounded && col <= b.max_col_rounded
      && row >= b.min_row && row <= b.max_row
    )
    if (!another) {
      plt.plot_pixel(canvas.image_data, row, col, dragged_info.color)
    }
  }
}

function update_drag_boundary(
  boundary: PartyPlotBoundary,
  dragged_info: PartyPlotInfo
) {
  dragged_info.max_row = boundary.max_row
  dragged_info.min_row = boundary.min_row
  dragged_info.min_col_rounded = boundary.min_col_rounded
  dragged_info.max_col_rounded = boundary.max_col_rounded
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

