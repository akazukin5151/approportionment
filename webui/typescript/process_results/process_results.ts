/** Functions that process SimulationResults immediately after they
 * are calculated, such as color and legend **/
import * as d3 from 'd3-color';
import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { ColorsAndLegend, Legend, SimulationResults } from "../types/core"
import { transform_to_radial } from "../colormap_nd/colormap_nd"
import { map_to_lch } from "../colormap_nd/colors"
import { map_to_d3 } from './utils';
import { COLORMAP_ND, DISCRETE_CMAPS } from '../cmaps';
import { reverse_cmap } from '../setup/setup_colorscheme_select';

export function calculate_colors_and_legend(r: SimulationResults): ColorsAndLegend {
  const btn = document.getElementById('cmap_select_btn')!
  const name = btn.innerText
  if (COLORMAP_ND.includes(name)) {
    return colormap_nd_selected(r)
  }

  if (DISCRETE_CMAPS.includes(name)) {
    return discrete_selected(r, name)
  }

  return continuous_selected(r, name)
}

function colormap_nd_selected(r: SimulationResults): ColorsAndLegend {
  const radviz = transform_to_radial(r.map(x => x.seats_by_party))
  const colors = map_to_lch(radviz.seat_coords)
  const legend_colors = map_to_lch(radviz.party_coords)
  const legend: Legend = {
    quantity: 'Party',
    colors: legend_colors,
    radviz: radviz
  }
  return { colors, legend }
}

function discrete_selected(r: SimulationResults, name: string): ColorsAndLegend {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  let scheme = d3_scale_chromatic[`scheme${name}`]
  if (reverse_cmap) {
    // copy the array and reverse the copy, leaving the original one in the module
    // unchanged
    scheme = scheme.slice().reverse()
  }
  return map_to_d3(r, (seats) => d3.rgb(scheme[seats % scheme.length]))
}

function continuous_selected(r: SimulationResults, name: string): ColorsAndLegend {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const scheme = d3_scale_chromatic[`interpolate${name}`]
  if (reverse_cmap) {
    return map_to_d3(r, (seats, max_seats) => d3.rgb(scheme(1 - seats / max_seats)))
  }
  return map_to_d3(r, (seats, max_seats) => d3.rgb(scheme(seats / max_seats)))
}

