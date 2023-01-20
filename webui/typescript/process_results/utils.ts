import { array_max } from "../std_lib"
import { ColorsAndLegend, Legend, Rgb, SimulationResult, SimulationResults } from "../types"
import { get_party_to_colorize } from "../form"

export function find_selected_option(elem: Element): Element | undefined {
  return Array.from(elem.children)
    .find(opt => (opt as HTMLOptionElement).selected)
}

export function get_name(selector: Element, idx: number): string | undefined {
  const elem = selector.children[idx]!
  const selected = find_selected_option(elem)
  return (selected as HTMLOptionElement | undefined)?.value
}

export function map_to_d3(
  r: SimulationResults,
  create_color: (seats: number, max_seats: number) => Rgb
): ColorsAndLegend {
  const max_seats = array_max(r.map(x => array_max(x.seats_by_party)))
  const legend_colors: Array<Rgb> = []
  for (let i = 0; i < max_seats; i++) {
    legend_colors.push(create_color(i, max_seats))
  }
  const colors = r.map(get_seats).map(s => create_color(s, max_seats))
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

