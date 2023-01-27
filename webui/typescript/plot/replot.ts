import * as d3 from "d3-color"
import { cache, party_changed } from "../cache"
import { clear_canvas, plot_colors_to_canvas } from "../canvas"
import { AppCache } from "../types/cache"
import { Canvas } from "../types/canvas"
import { create_text_td } from "../td"
import { plot_color_wheel_legend } from "../color_wheel/color_wheel"
import { calculate_colors_and_legend } from "../process_results/process_results"
import { remove_all_children } from "../dom"

export function replot(simulation_canvas: Canvas): void {
  if (cache && !party_changed) {
    const { colors, legend } = calculate_colors_and_legend(cache.cache)
    cache.colors = colors
    cache.legend = legend
    clear_canvas(simulation_canvas.ctx)
    plot_colors_to_canvas(simulation_canvas, colors)
    rebuild_legend(simulation_canvas, cache)
  }
}

export function rebuild_legend(simulation_canvas: Canvas, cache: AppCache): void {
  const table = document.getElementById('legend-table')!
  const thead = table.getElementsByTagName('thead')[0]!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  const quantity_header = thead.children[0]!.children[1] as HTMLElement
  quantity_header.innerText = cache.legend.quantity

  remove_all_children(tbody)

  build_legend_table(cache, tbody)

  if (cache.legend.quantity === "Party") {
    plot_color_wheel_legend(simulation_canvas, cache)
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
