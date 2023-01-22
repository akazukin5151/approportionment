import { calculate_coalition_seats, set_coalition_seat } from "../../coalition_table/coalition_table"
import { Canvas, SimulationResult, SimulationResults } from "../../types/core"
import { GridCoords } from "../../types/xy"
import { cache, party_changed } from "../../cache"
import { find_hovered_party } from "./hovered_party"
import { get_canvas_dimensions, parties_from_table } from "../../form"
import { interact_with_legend } from "./legend"
import { grid_x_to_pct, grid_y_to_pct, pointer_pct_to_grid, pointer_to_pct } from "../../convert_locations"
import { array_sum } from "../../std_lib"
import { clear_canvas } from "../../canvas"
import { CANVAS_SIDE, TAU } from "../../constants"

export function on_pointer_move(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  evt: Event
): void {
  const e = evt as MouseEvent
  const canvas_dimensions = get_canvas_dimensions()
  const hover = find_hovered_party(e.offsetX, e.offsetY, canvas_dimensions)
  if (hover) {
    document.body.style.cursor = 'grab'
  } else {
    document.body.style.cursor = 'crosshair'
  }

  if (!cache || party_changed) {
    return
  }
  const grid_xy = pointer_pct_to_grid(pointer_to_pct(e))
  const { idx, point } = find_closest_point(cache.cache, grid_xy)
  const seats_by_party = point.seats_by_party

  plot_voters(simulation_canvas, voter_canvas, point)

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

function plot_voters(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  point: SimulationResult
): void {
  simulation_canvas.elem.style.filter = 'opacity(.2)'
  const ctx = voter_canvas.ctx
  clear_canvas(ctx)
  ctx.fillStyle = '#0000007f'
  point.voters.forEach(voter => {
    const pct_x = grid_x_to_pct(voter.x)
    const pct_y = grid_y_to_pct(voter.y)
    const x = pct_x * CANVAS_SIDE
    const y = pct_y * CANVAS_SIDE
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, TAU, true)
    ctx.stroke()
  })
  voter_canvas.elem.style.display = 'initial'
}

/**
 * Recalculate party seats and coalition seats and update the numbers in the HTML
 */
function recalculate_all_seats(
  seats_by_party: Array<number>,
  party_tr: Element,
  idx: number
): void {
  const seats = seats_by_party[idx]!

  // set the seats in the party table
  const seats_td = party_tr.children[5] as HTMLElement
  const p = seats_td.getElementsByTagName('p')[0] as HTMLElement
  p.innerText = seats.toString()
  const sparkline = seats_td.getElementsByTagName('div')[0]!
  const width = sparkline_width(seats, seats_by_party, seats_td)
  sparkline.style.width = `${width}px`

  // recalculate coalition seats
  const coalition_col = party_tr.children[6]!.children[0]!;
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
