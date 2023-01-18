/** Functions that process SimulationResults immediately after they
 * are calculated, such as color and legend **/
import { Colormap } from "./colormap"
import { array_max, array_sum } from "./std_lib"
import { ColorsAndLegend, Legend, Rgb, SimulationResult, SimulationResults } from "./types"
import { transform_to_radial } from "./colormap_nd/colormap_nd"
import { map_to_lch } from "./colormap_nd/colors"
import { get_party_to_colorize } from "./form"

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
    const legend: Legend = {
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
    const legend: Legend = {
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

