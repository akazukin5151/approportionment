import { calculate_coalition_seats, set_coalition_seat } from "../../coalition_table/coalition_table"
import { GridCoords, SimulationPoint } from "../../types"
import { cache, party_changed } from "../../cache"
import { pointer_to_pct, pointer_pct_to_grid, find_hovered_party } from "./utils"
import { parties_from_table } from "../../utils"
import { get_party_to_colorize } from "../../plot_utils"

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
  const closest_point = find_closest_point(cache.cache, grid_xy)
  const seats_by_party = closest_point.seats_by_party

  parties_from_table().forEach((party_tr, idx) => {
    recalculate_all_seats(seats_by_party, party_tr, idx)
  })

  const legend_table = document.getElementById('legend-table') as HTMLElement
  const header_tr = legend_table.children[1]?.children[0]
  const quantity_td = header_tr?.children[1] as HTMLElement
  const quantity_name = quantity_td.innerText
  if (quantity_name === 'Seats') {
    highlight_legend(legend_table, seats_by_party)
  }
}

function find_closest_point(
  cache: Array<SimulationPoint>,
  grid_xy: GridCoords
): SimulationPoint {
  return cache
    .map(point => {
      return {
        point: point,
        distance:
          Math.sqrt((point.x - grid_xy.grid_x) ** 2 + (point.y - grid_xy.grid_y) ** 2)
      }
    })
    .reduce((acc, x) => x.distance < acc.distance ? x : acc)
    .point
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

/** highlight the row in the legend that corresponds to the seat counts
 * of the point being hovered **/
function highlight_legend(
  // earlier we had to query for this to check the colorscheme anyway
  // so more ergonomic to pass it to this function
  legend_table: HTMLElement,
  seats_by_party: Array<number>
): void {
  // this is fast enough, no need to store in global to squeeze out some
  // insignificant performance gains
  const ptc = get_party_to_colorize()
  const seats_of_point = seats_by_party[ptc]
  const tbody = legend_table.children[2]!
  const trs = tbody.children
  for (const tr of trs) {
    const row = tr as HTMLElement
    const seat_td = tr.children[1] as HTMLElement
    if (seat_td.innerText === seats_of_point?.toString()) {
      row.style.backgroundColor = 'var(--marked)'
    } else {
      row.style.backgroundColor = 'initial'
    }
  }
}

