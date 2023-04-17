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
  const idx = party_manager.coalition_num_to_index(coalition_num)
  if (idx == null) {
    return 0
  }
  const parties = party_manager.coalitions[idx]!.parties
  let total = 0
  for (const party of parties) {
    const i = party_manager.num_to_index(party)!
    total += seats_by_party[i]!
  }
  return total
}

export function set_coalition_seat(coalition_num: string, seats: number): void {
  // const row = coalitions_from_table()
  //   .find(row => (row.children[0] as HTMLElement).innerText === coalition_num);
  // if (row) {
  //     (row.children[1] as HTMLElement).innerText = seats.toString()
  // }
}

