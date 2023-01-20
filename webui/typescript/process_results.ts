/** Functions that process SimulationResults immediately after they
 * are calculated, such as color and legend **/
import * as d3 from 'd3-color';
import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { array_max } from "./std_lib"
import { ColorsAndLegend, Legend, Rgb, SimulationResult, SimulationResults } from "./types"
import { transform_to_radial } from "./colormap_nd/colormap_nd"
import { map_to_lch } from "./colormap_nd/colors"
import { get_party_to_colorize } from "./form"

function find_selected_option(elem: Element): Element | undefined {
  return Array.from(elem.children)
    .find(opt => (opt as HTMLOptionElement).selected)
}

export function calculate_colors_and_legend(r: SimulationResults): ColorsAndLegend {
  const selector = document.getElementById('cmap_select')!
  const colormap_nd = selector.children[2]!
  let selected = find_selected_option(colormap_nd)
  if (selected) {
    return colormap_nd_selected(r)
  }

  const discrete = selector.children[0]!
  selected = find_selected_option(discrete)
  if (selected) {
    return discrete_selected(r, selected)
  }

  const continuous = selector.children[1]!
  selected = find_selected_option(continuous)
  return continuous_selected(r, selected!)
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

function discrete_selected(
  r: SimulationResults,
  selected: Element
): ColorsAndLegend {
  const name = (selected as HTMLOptionElement).value
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const scheme = d3_scale_chromatic[`scheme${name}`]
  const max_seats =
    Math.max(array_max(r.map(x => array_max(x.seats_by_party))), scheme.length)
  const legend_colors: Array<Rgb> = []
  for (let i = 0; i < max_seats; i++) {
    const color = d3.rgb(scheme[i])
    legend_colors.push(color)
  }
  const colors = r.map(get_seats).map(s => d3.rgb(scheme[s % scheme.length]))
  const legend: Legend = {
    quantity: 'Seats',
    colors: legend_colors,
    radviz: null
  }
  return { colors, legend }
}

function continuous_selected(
  r: SimulationResults,
  selected: Element
): ColorsAndLegend {
  const name = (selected as HTMLOptionElement).value
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const scheme = d3_scale_chromatic[`interpolate${name}`]
  const max_seats = array_max(r.map(x => array_max(x.seats_by_party)))
  const legend_colors: Array<Rgb> = []
  for (let i = 0; i < max_seats; i++) {
    const color = d3.rgb(scheme(i / max_seats))
    legend_colors.push(color)
  }
  const colors = r.map(get_seats).map(s => d3.rgb(scheme(s / max_seats)))
  const legend: Legend = {
    quantity: 'Seats',
    colors: legend_colors,
    radviz: null
  }
  return { colors, legend }
}

function get_seats({ seats_by_party }: SimulationResult): number {
  const party_to_colorize = get_party_to_colorize();
  return seats_by_party[party_to_colorize]!;
}

