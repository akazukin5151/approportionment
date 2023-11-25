import { party_manager } from "../cache"
import { clear_canvas } from "../canvas"
import { plot_single_party } from "../plot/party/plot_party"
import { replot } from "../plot/replot"
import { AllCanvases } from "../types/canvas"

export function colorize_by_handler(
  e: Event,
  all_canvases: AllCanvases,
  party_nums: Array<number>
): void {
  const elem = document.getElementsByClassName('colorize-by')[0]
  elem?.classList.remove('colorize-by')
  const t = e.target as HTMLElement
  t.classList.add('colorize-by')

  replot(all_canvases.simulation)

  clear_canvas(all_canvases.party.ctx, true)
  party_manager.parties.forEach(
    p => plot_single_party(all_canvases.party, p, party_nums.includes(p.num))
  )
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
