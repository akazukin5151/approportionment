import { party_manager } from "../cache"
import { replot } from "../plot/replot"
import { Canvas } from "../types/canvas"

export function colorize_by_handler(e: Event, simulation_canvas: Canvas): void {
  const elem = document.getElementsByClassName('colorize-by')[0]
  elem?.classList.remove('colorize-by')
  const t = e.target as HTMLElement
  t.classList.add('colorize-by')
  replot(simulation_canvas)
}

export function calculate_coalition_seats(
  coalition_num: number | null,
  seats_by_party: Array<number>
): number {
  const parties = party_manager.coalitions.get_parties(coalition_num) ?? []
  let total = 0
  for (const party of parties) {
    const i = party_manager.num_to_index(party)!
    total += seats_by_party[i]!
  }
  return total
}

export function all_coalition_seats(seats_by_party: Array<number>): Array<number> {
  return Array.from(party_manager.coalitions.iter_coalitions())
    .map(coalition =>
      calculate_coalition_seats(coalition.coalition_num, seats_by_party)
    )
}
