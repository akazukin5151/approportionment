import { calculate_coalition_seats, set_coalition_seat } from "../../coalition_table/coalition_table"
import { GridCoords, SimulationResult, SimulationResults } from "../../types"
import { cache, party_changed } from "../../cache"
import { find_hovered_party } from "./hovered_party"
import { parties_from_table } from "../../form"
import { interact_with_legend } from "./legend"
import { pointer_pct_to_grid, pointer_to_pct } from "../../convert_locations"

export function on_pointer_move(evt: Event): void {
  const e = evt as MouseEvent
  const hover = find_hovered_party(e)
  if (hover) {
    document.body.style.cursor = 'grab'
  } else {
    document.body.style.cursor = 'crosshair'
  }

  if (!cache || party_changed) {
    return
  }
  const target = e.target as HTMLElement
  const grid_xy = pointer_pct_to_grid(pointer_to_pct(target, e))
  const { idx, point } = find_closest_point(cache.cache, grid_xy)
  const seats_by_party = point.seats_by_party

  parties_from_table().forEach((party_tr, idx) => {
    recalculate_all_seats(seats_by_party, party_tr, idx)
  })

  interact_with_legend(cache, seats_by_party, idx)
}

function find_closest_point(
  cache: SimulationResults,
  grid_xy: GridCoords
): { idx: number; point: SimulationResult } {
  const { idx, point } = cache
    .map((point, idx) => {
      return {
        idx,
        point,
        distance:
          Math.sqrt(
            (point.x - grid_xy.grid_x) ** 2 + (point.y - grid_xy.grid_y) ** 2
          )
      }
    })
    .reduce((acc, x) => x.distance < acc.distance ? x : acc)
  return { idx, point }
}

/**
 * Recalculate party seats and coalition seats and update the numbers in the HTML
 */
function recalculate_all_seats(
  seats_by_party: Array<number>,
  party_tr: Element,
  idx: number
): void {
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

