import { cache, set_cache } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { load_parties } from "./load_parties"
import { Colormap } from "./colormap"
import { array_max, array_sum, parties_equals } from "./std_lib"
import { Canvas, Legend, Rgb, SimulationPoint, SimulationResult, SimulationResults } from "./types"
import { map_to_lch, transform_to_radial } from "./colormap_nd"
import { create_text_td } from "./td"
import * as d3 from "d3-color"

export function replot(simulation_canvas: Canvas): void {
  const parties = load_parties()
  if (cache && parties_equals(cache.parties, parties)) {
    const { new_cache, legend } = calculate_cache_and_legend(cache.cache)
    set_cache({ cache: new_cache, parties })
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, new_cache.map(p => p.color))
    rebuild_legend(legend)
  }
}

type CacheAndLegend = {
  new_cache: Array<SimulationPoint>;
  legend: Legend
}

export function calculate_cache_and_legend(r: SimulationResults): CacheAndLegend {
  // TODO: copied from Colormap
  const selector = document.getElementById('cmap_select')!
  const colormap_nd = selector.children[2]!
  const selected = Array.from(colormap_nd.children)
    .find(opt => (opt as HTMLOptionElement).selected)

  if (selected) {
    const radviz = transform_to_radial(r.map(x => x.seats_by_party))
    const colors = map_to_lch(radviz.seat_coords)
    const legend_colors = map_to_lch(radviz.party_coords)
    const new_cache = r.map((x, i) => ({ ...x, color: colors[i]! }))
    const legend = {
      quantity: 'Party',
      colors: legend_colors,
      radviz: radviz
    }
    return { new_cache, legend }
  } else {
    const max_seats = array_max(r.map(x => array_max(x.seats_by_party)))
    // TODO: duplicated code
    const cmap = new Colormap()
    let legend_colors: Array<Rgb> = []
    for (let i = 0; i < max_seats; i++) {
      legend_colors.push(cmap.map(i, max_seats))
    }
    const new_cache = r.map(map_seats_to_cmap)
    const legend = {
      quantity: 'Seats',
      colors: legend_colors,
      radviz: null
    }
    return { new_cache, legend }
  }
}

/** Map seats_by_party to a D3 colormap **/
function map_seats_to_cmap(
  { x, y, seats_by_party }: SimulationResult
): SimulationPoint {
  const party_to_colorize = get_party_to_colorize();
  const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
  const cmap = new Colormap()
  const color = cmap.map(seats_for_party_to_colorize, array_sum(seats_by_party));
  return { x, y, color, seats_by_party };
}

function get_party_to_colorize(): number {
  const radio = document.getElementsByClassName('party_radio');
  const checked = Array.from(radio)
    .map((elem, idx) => ({ elem, idx }))
    .find(({ elem }) => (elem as HTMLInputElement).checked);
  return checked?.idx ?? 2
}

export function rebuild_legend(legend: Legend) {
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
    square.style.backgroundColor = color.toString()
    color_td.appendChild(square)
    tr.appendChild(color_td)

    tr.appendChild(create_text_td(idx))
    tbody.appendChild(tr)
  })

  // TODO
  if (legend.quantity === "Party") {
    plot_color_wheel(legend)
  }
}

// https://stackoverflow.com/questions/41844110/ploting-rgb-or-hex-values-on-a-color-wheel-using-js-canvas
function plot_color_wheel(legend: Legend) {
  // the max chroma
  // each ring with radius r corresponds to a chroma value of r
  const max_radius = 70
  const radius_step = 5

  const canvas = document.createElement('canvas')
  // canvas dimensions are larger than the radius as we want to plot labels
  canvas.width = 200
  canvas.height = 200

  const ctx = canvas.getContext('2d')!
  let origin = canvas.width / 2

  for (let radius = max_radius; radius > 0; radius -= radius_step) {
    const step = 1 / radius;
    for (let i = 0; i < 360; i += step) {
      const rad = i * (2 * Math.PI) / 360
      const color = d3.hcl(i, radius, 55)
      ctx.strokeStyle = color.rgb().clamp().toString()

      // x and y components of this angle
      const x = radius * Math.cos(rad)
      const y = radius * Math.sin(rad)

      ctx.beginPath()
      // move to the origin
      ctx.moveTo(origin, origin)
      // draw a line from origin to circumference of circle
      ctx.lineTo(origin + x, origin + y)
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.fillStyle = 'black'
  legend.radviz!.party_coords.forEach(coord => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    ctx.arc(origin + x, origin + y, 5, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
  })

  ctx.strokeStyle = 'lightgray'
  legend.radviz!.seat_coords.forEach(coord => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    ctx.arc(origin + x, origin + y, 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.stroke()
  })

  const container = document.getElementById('color-wheel')!
  container.appendChild(canvas)
}
