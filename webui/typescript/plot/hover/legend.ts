/** Functions for interacting with the legend on hover **/
import { clear_canvas } from "../../canvas"
import { ORIGIN } from "../../color_wheel/constants"
import { MAX_CHROMA, TAU } from "../../constants"
import { get_party_to_colorize } from "../../form"
import { AppCache } from "../../types"

const DOT_RADIUS = 4


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
      row.style.backgroundColor = 'var(--marked)'
    } else {
      row.style.backgroundColor = 'initial'
    }
  }
}

function highlight_colorwheel(cache: AppCache, hover_point_idx: number): void {
  const seat_coord = cache.legend.radviz!.seat_coords[hover_point_idx]
  if (seat_coord) {
    const canvas = document.getElementById('color-wheel-hover') as HTMLCanvasElement
    canvas.style.display = 'initial'
    const ctx = canvas.getContext('2d')!
    const x = MAX_CHROMA * seat_coord.grid_x
    const y = MAX_CHROMA * seat_coord.grid_y

    clear_canvas(ctx)
    ctx.fillStyle = '#00ff00'
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.arc(ORIGIN + x, ORIGIN - y, DOT_RADIUS, 0, TAU, true)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
}
