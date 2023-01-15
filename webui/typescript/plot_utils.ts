import { cache, set_cache } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { load_parties } from "./load_parties"
import { Colormap } from "./colormap"
import { array_max, array_sum, parties_equals } from "./std_lib"
import { Canvas, Rgb, SimulationPoint, SimulationResult, SimulationResults } from "./types"
import { map_to_lch, transform_to_radial } from "./colormap_nd"
import { create_text_td } from "./td"

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

export function calculate_cache_and_legend(
  r: SimulationResults
): { new_cache: Array<SimulationPoint>; legend: Rgb[] } {
  // TODO: copied from Colormap
  const selector = document.getElementById('cmap_select')!
  const colormap_nd = selector.children[2]!
  const selected = Array.from(colormap_nd.children)
    .find(opt => (opt as HTMLOptionElement).selected)

  if (selected) {
    const radviz = transform_to_radial(r.map(x => x.seats_by_party))
    const colors = map_to_lch(radviz.seat_coords)
    const legend = map_to_lch(radviz.party_coords)
    const new_cache = r.map((x, i) => ({ ...x, color: colors[i]! }))
    return { new_cache, legend }
  } else {
    const max_seats = array_max(r.map(x => x.seats_by_party.length))
    // TODO: duplicated code
    const cmap = new Colormap()
    let legend: Array<Rgb> = []
    for (let i = 0; i < max_seats; i++) {
      legend.push(cmap.map(i, max_seats))
    }
    const new_cache = r.map(map_seats_to_cmap)
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

export function rebuild_legend(legend: Array<Rgb>) {
  const table = document.getElementById('legend-table')!
  const tbody = table.children[1]!

  while (tbody.lastChild) {
    tbody.removeChild(tbody.lastChild)
  }

  legend.forEach((color, idx) => {
    const tr = document.createElement('tr')

    const color_td = document.createElement('td')
    const square = document.createElement('div')
    square.style.width = '20px'
    square.style.height = '20px'
    square.style.backgroundColor = color.toString()
    color_td.appendChild(square)
    tr.appendChild(color_td)

    tr.appendChild(create_text_td(idx))
    tbody.appendChild(tr)
  })
}

