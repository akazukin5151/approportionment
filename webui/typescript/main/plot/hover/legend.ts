/** Functions for interacting with the legend on hover **/
import { calculate_coalition_seats } from "../../coalition_table/coalition_table"
import { get_colorize_by } from "../../form"
import { get_quantity_header } from "../../legend"
import { AppCache } from "../../types/cache"
import { highlight_colorwheel } from "./colorwheel"

export function interact_with_legend(
  cache: AppCache,
  seats_by_party: Array<number>,
  hover_point_idx: number
): void {
  const legend_table = document.getElementById('legend-table') as HTMLElement
  const quantity_name = get_quantity_header(legend_table).innerText
  if (quantity_name === 'Seats') {
    highlight_legend(legend_table, seats_by_party)
  } else {
    highlight_colorwheel(cache, hover_point_idx)
  }
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
  const tc = get_colorize_by()
  if (tc.quantity === 'party') {
    const seats_of_point = seats_by_party[tc.num]
    return highlight_inner(legend_table, seats_of_point)
  }
  const seats = calculate_coalition_seats(tc.num, seats_by_party)
  return highlight_inner(legend_table, seats)
}

function highlight_inner(
  legend_table: HTMLElement,
  seats_of_point: number | undefined
): void {
  const tbody = legend_table.children[1]!
  const trs = tbody.children
  for (const tr of trs) {
    const row = tr as HTMLElement
    const seat_td = tr.children[1] as HTMLElement
    if (seat_td.innerText === seats_of_point?.toString()) {
      row.style.backgroundColor = 'var(--hover-highlight-color)'
    } else {
      row.style.backgroundColor = 'initial'
    }
  }
}

