import { array_max, array_sum } from "../std_lib"
import { SimulationResults } from "../types/election"
import { Rgb } from "../types/core"
import { ColorsAndLegend, Legend } from "../types/cache"
import { get_colorize_by, } from "../form"
import { party_manager } from "../cache"

export function map_to_d3(
  r: SimulationResults,
  create_color: (seats: number, max_seats: number) => Rgb
): ColorsAndLegend {
  const get_seats = get_seats_f()
  const seats = r.map(x => get_seats(x.seats_by_party))
  const max_seats = array_max(seats)
  const legend_colors: Array<Rgb> = []
  // we need to color "0 seats" and "${max_seats} seats"
  for (let i = 0; i < max_seats + 1; i++) {
    legend_colors.push(create_color(i, max_seats))
  }
  const colors = seats.map(s => create_color(s, max_seats))
  const legend: Legend = {
    quantity: 'Seats',
    colors: legend_colors,
    radviz: null
  }
  return { colors, legend }
}

function get_seats_f(): (seats_by_party: Array<number>) => number {
  const to_colorize = get_colorize_by();
  if (to_colorize.quantity === 'party') {
    const idx = party_manager.num_to_index(to_colorize.num)
    if (idx == null) {
      throw new Error('idx is null')
    }
    return x => x[idx]!;
  }
  const parties_in_coalition = party_manager.coalitions.get_parties(to_colorize.num)
  if (!parties_in_coalition) {
    throw new Error('cannot find coalition')
  }
  return x => array_sum(
    parties_in_coalition.map(party => x[party]!)
  )
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