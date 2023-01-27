/** Functions for interacting with the legend on hover **/
import { get_party_to_colorize } from "../../form"
import { AppCache } from "../../types/cache"
import { highlight_colorwheel } from "./colorwheel"

export function interact_with_legend(
  cache: AppCache,
  seats_by_party: Array<number>,
  hover_point_idx: number
): void {
  const legend_table = document.getElementById('legend-table') as HTMLElement
  const header_tr = legend_table.children[1]?.children[0]
  const quantity_td = header_tr?.children[1] as HTMLElement
  const quantity_name = quantity_td.innerText
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
  const ptc = get_party_to_colorize()
  const seats_of_point = seats_by_party[ptc]
  const tbody = legend_table.children[2]!
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
