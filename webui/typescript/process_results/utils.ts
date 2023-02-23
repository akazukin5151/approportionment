import { array_max, array_sum } from "../std_lib"
import { SimulationResult, SimulationResults } from "../types/election"
import { Rgb } from "../types/core"
import { ColorsAndLegend, Legend } from "../types/cache"
import { get_colorize_by, parties_from_table } from "../form"

export function map_to_d3(
  r: SimulationResults,
  create_color: (seats: number, max_seats: number) => Rgb
): ColorsAndLegend {
  const seats = r.map(get_seats)
  const max_seats = array_max(seats)
  const legend_colors: Array<Rgb> = []
  for (let i = 0; i < max_seats; i++) {
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

// TODO: performance: lift unchanging computations out of loop
function get_seats({ seats_by_party }: SimulationResult): number {
  const to_colorize = get_colorize_by();
  if (to_colorize.startsWith('Party')) {
    const party_to_colorize = parseInt(to_colorize.slice('Party '.length))
    return seats_by_party[party_to_colorize]!;
  }

  const coalition_to_colorize = parseInt(to_colorize.slice('Coalition '.length))
  const parties_in_coalition =
    parties_from_table()
      .filter(tr => {
        const td = tr.children[5]!
        const select = td.children[0] as HTMLSelectElement
        const selected = Array.from(select.children)
          .map((opt, idx) => ({ opt: opt as HTMLOptionElement, idx }))
          .find(({ opt }) => opt.selected)
        return selected?.idx == coalition_to_colorize
      })
      .map(tr => {
        const num = tr.children[0]! as HTMLElement
        return parseInt(num.innerText)
      })

  return array_sum(parties_in_coalition.map(idx => seats_by_party[idx]!))
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
