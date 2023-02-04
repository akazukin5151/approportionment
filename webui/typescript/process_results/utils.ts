import { array_max } from "../std_lib"
import { SimulationResult, SimulationResults } from "../types/election"
import { Rgb } from "../types/core"
import { ColorsAndLegend, Legend } from "../types/cache"
import { get_party_to_colorize } from "../form"

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

export function map_to_permutations(
  r: SimulationResults,
  create_color: (seats: number, n_colors: number) => Rgb
): ColorsAndLegend {
  const seats = r.map(x => JSON.stringify(x.seats_by_party))
  const uniques = Array.from(new Set(seats))
  const n_colors = uniques.length

  const colors = []
  for (const seat of seats) {
    const idx = uniques.findIndex(x => x === seat)
    colors.push(create_color(idx, n_colors))
  }

  // problems with the legend:
  // 1) there will be lots of duplicated colors
  // 1) the legend too long, even if it can scroll independently
  // 2) it's hard to understand when the pointer is hovering the chart
  // 3) labels are meaningless numbers
  //
  // as the permutations encodes information of every party's seats, the labels
  // should show all parties seat counts ... which is what the party table does
  // so the legend is redundant
  const legend: Legend = {
    quantity: 'Seats',
    colors: [],
    radviz: null
  }
  return { colors, legend }
}
