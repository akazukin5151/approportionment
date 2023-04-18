import { plot_color_wheel_legend } from "./color_wheel/color_wheel";
import { remove_all_children } from "./dom";
import { create_text_td } from "./td";
import { AppCache } from "./types/cache";
import { Canvas } from "./types/canvas";

export function get_quantity_header(table: HTMLElement): HTMLElement {
  const rows = table.getElementsByTagName('thead')[0]!
  const header_row = rows.children[0]!
  const quantity_header = header_row.children[0] as HTMLElement
  return quantity_header
}

export function rebuild_legend(
  simulation_canvas: Canvas,
  cache: AppCache,
  cmap_name: string
): void {
  const table = document.getElementById('legend-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  const quantity_header = get_quantity_header(table)
  quantity_header.innerText = cache.legend.quantity

  remove_all_children(tbody)

  build_legend_table(cache, tbody)

  if (cache.legend.quantity === "Party") {
    plot_color_wheel_legend(simulation_canvas, cache, cmap_name)
  } else {
    hide_color_wheels()
  }
}

function build_legend_table(
  cache: AppCache,
  tbody: HTMLTableSectionElement
): void {
  cache.legend.colors.forEach((color, idx) => {
    const tr = document.createElement('tr')

    const color_td = document.createElement('td')
    const square = document.createElement('div')
    square.style.width = '20px'
    square.style.height = '20px'
    square.className = 'center-align'
    square.style.backgroundColor = (color as d3.RGBColor).formatRgb()
    color_td.appendChild(square)
    tr.appendChild(color_td)

    tr.appendChild(create_text_td(idx))
    tbody.appendChild(tr)
  })
}

function hide_color_wheels(): void {
  const container = document.getElementById('color-wheel-container')!
  container.style.display = 'none'

  const wheel_canvas = document.getElementById('color-wheel')
  if (wheel_canvas) {
    wheel_canvas.style.display = 'none'
  }

  const seat_canvas = document.getElementById('color-wheel-seats')!
  seat_canvas.style.display = 'none'

  const party_canvas = document.getElementById('color-wheel-party')!
  party_canvas.style.display = 'none'
}
