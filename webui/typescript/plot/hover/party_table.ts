import {
  calculate_coalition_seats,
  set_coalition_seat
} from "../../coalition_table/coalition_table"
import { array_sum } from "../../std_lib"

/**
 * Recalculate party seats and coalition seats and update the numbers in the HTML
 */
export function recalculate_all_seats(
  seats_by_party: Array<number>,
  party_tr: Element,
  idx: number
): void {
  const seats = seats_by_party[idx]!

  // set the seats in the party table
  const seats_td = party_tr.children[4] as HTMLElement
  const p = seats_td.getElementsByTagName('p')[0] as HTMLElement
  p.innerText = seats.toString()
  const sparkline = seats_td.getElementsByTagName('div')[0]!
  const width = sparkline_width(seats, seats_by_party, seats_td)
  sparkline.style.display = 'initial'
  sparkline.style.width = `${width}px`

  // recalculate coalition seats
  const coalition_col = party_tr.children[5]!.children[0]!;
  const coalition = (coalition_col as HTMLSelectElement).selectedOptions[0]!
  const coalition_seats = calculate_coalition_seats(coalition.text)
  set_coalition_seat(coalition.text, coalition_seats)
}

function sparkline_width(
  seats: number,
  seats_by_party: Array<number>,
  seats_td: HTMLElement
): number {
  // there is a margin left of 5px for padding
  // let's also add a margin of 5px on the right
  const margin = 5
  const max_width = seats_td.offsetWidth - margin - margin
  const total_seats = array_sum(seats_by_party)
  const pct = seats / total_seats
  return pct * max_width
}
