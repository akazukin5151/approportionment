import * as d3 from "d3-color"
import { cache, party_changed } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { Colormap } from "./colormap"
import { array_max, array_sum } from "./std_lib"
import { Canvas, Legend, Rgb, SimulationResult, SimulationResults } from "./types"
import { transform_to_radial } from "./colormap_nd/colormap_nd"
import { create_text_td } from "./td"
import { plot_color_wheel_legend } from "./color_wheel/color_wheel"
import { map_to_lch } from "./colormap_nd/colors"

export function replot(simulation_canvas: Canvas): void {
  if (cache && !party_changed) {
    const { colors, legend } = calculate_colors_and_legend(cache.cache)
    cache.colors = colors
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, colors)
    rebuild_legend(legend)
  }
}

type ColorsAndLegend = {
  colors: Array<Rgb>,
  legend: Legend
}

export function calculate_colors_and_legend(r: SimulationResults): ColorsAndLegend {
  // TODO: copied from Colormap
  const selector = document.getElementById('cmap_select')!
  const colormap_nd = selector.children[2]!
  const selected = Array.from(colormap_nd.children)
    .find(opt => (opt as HTMLOptionElement).selected)

  if (selected) {
    const radviz = transform_to_radial(r.map(x => x.seats_by_party))
    const colors = map_to_lch(radviz.seat_coords)
    const legend_colors = map_to_lch(radviz.party_coords)
    const legend = {
      quantity: 'Party',
      colors: legend_colors,
      radviz: radviz
    }
    return { colors, legend }
  } else {
    const max_seats = array_max(r.map(x => array_max(x.seats_by_party)))
    // TODO: duplicated code
    const cmap = new Colormap()
    const legend_colors: Array<Rgb> = []
    for (let i = 0; i < max_seats; i++) {
      legend_colors.push(cmap.map(i, max_seats))
    }
    const colors = r.map(map_seats_to_cmap)
    const legend = {
      quantity: 'Seats',
      colors: legend_colors,
      radviz: null
    }
    return { colors, legend }
  }
}

/** Map seats_by_party to a D3 colormap **/
function map_seats_to_cmap(
  { seats_by_party }: SimulationResult
): Rgb {
  const party_to_colorize = get_party_to_colorize();
  const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
  const cmap = new Colormap()
  return cmap.map(seats_for_party_to_colorize, array_sum(seats_by_party))
}

export function get_party_to_colorize(): number {
  const radio = document.getElementsByClassName('party_radio');
  const checked = Array.from(radio)
    .map((elem, idx) => ({ elem, idx }))
    .find(({ elem }) => (elem as HTMLInputElement).checked);
  return checked?.idx ?? 2
}

export function rebuild_legend(legend: Legend): void {
  const table = document.getElementById('legend-table')!
  const thead = table.getElementsByTagName('thead')[0]!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  const quantity_header = thead.children[0]!.children[1] as HTMLElement
  quantity_header.innerText = legend.quantity

  while (tbody.lastChild) {
    tbody.removeChild(tbody.lastChild)
  }

  legend.colors.forEach((color, idx) => {
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

  if (legend.quantity === "Party") {
    plot_color_wheel_legend(legend)
  }
}

