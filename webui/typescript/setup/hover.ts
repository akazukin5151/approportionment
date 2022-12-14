import { calculate_coalition_seats, set_coalition_seat } from "../coalition_table/coalition_table"
import { Point } from "../types"
import { cache } from "./setup_worker"

export function on_pointer_move(evt: Event): void {
  if (!cache) {
    return
  }
  const e = evt as MouseEvent
  const target = e.target! as HTMLElement
  const scaled = scale_pointer_to_grid(target, e)
  const closest_point = find_closest_point(cache, scaled)
  const seats_by_party = closest_point.point.seats_by_party

  const party_table = document.getElementById('party-table')!
  const party_tbody = party_table.children[0]!
  Array.from(party_tbody.children).forEach((party_tr, idx) => {
    recalculate_all_seats(seats_by_party, party_tr, idx)
  })
}

type Scaled = { x: number; y: number; }

function scale_pointer_to_grid(target: HTMLElement, e: MouseEvent): Scaled {
  const max_y = target.clientHeight + target.offsetTop
  const max_x = target.clientWidth + target.offsetLeft
  const norm_x = e.offsetX / max_x
  const norm_y = e.offsetY / max_y
  // scaled to grid coordinates
  const scaled_x = norm_x * 2 - 1
  const scaled_y = -1 * ((norm_y) * 2 - 1)
  return { x: scaled_x, y: scaled_y }
}

function find_closest_point(cache: Array<Point>, scaled: Scaled) {
  return cache
    .map(point => {
      return {
        point: point,
        distance:
          Math.sqrt((point.x - scaled.x) ** 2 + (point.y - scaled.y) ** 2)
      }
    })
    .reduce((acc, x) => x.distance < acc.distance ? x : acc)
}

// recalculate party seats and coalition seats and update the numbers in the HTML
function recalculate_all_seats(
  seats_by_party: Array<number>,
  party_tr: Element,
  idx: number
) {
  if (idx === 0) {
    return
  }
  // set the seats in the party table
  const seats_col = party_tr.children[5] as HTMLElement
  // the first idx for the table is the header row
  seats_col.innerText = seats_by_party[idx - 1]!.toString()

  // recalculate coalition seats
  const coalition_col = party_tr.children[6]!.children[0]!;
  const coalition = (coalition_col as HTMLSelectElement).selectedOptions[0]!
  const seats = calculate_coalition_seats(coalition.text)
  set_coalition_seat(coalition.text, seats)
}


