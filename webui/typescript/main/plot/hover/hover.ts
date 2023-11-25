import { Canvas } from "../../types/canvas"
import { SimulationResult, SimulationResults } from "../../types/election"
import { GridCoords } from "../../types/position"
import { party_bar_chart, cache, party_manager, coalition_bar_chart } from "../../cache"
import { get_canvas_dimensions, } from "../../form"
import { interact_with_legend } from "./legend"
import { pointer_pct_to_grid, pointer_to_pct } from "../../convert_locations"
import { all_coalition_seats, calculate_coalition_seats } from "../../coalition_table/coalition_table"
import { plot_voter_canvas } from "./voter_canvas"

export function on_pointer_move(
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  evt: Event
): void {
  const e = evt as MouseEvent
  const canvas_dimensions = get_canvas_dimensions()
  const hover =
    party_manager.find_hovered_party(e.offsetX, e.offsetY, canvas_dimensions)
  if (hover) {
    document.body.style.cursor = 'grab'
  } else {
    document.body.style.cursor = 'crosshair'
  }
  hover_inner(e, simulation_canvas, voter_canvas)
}

function hover_inner(
  e: MouseEvent,
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
): void {
  if (!cache || party_manager.party_changed) {
    return
  }
  const grid_xy = pointer_pct_to_grid(pointer_to_pct(e))
  const { idx, point } = find_closest_point(cache.cache, grid_xy)
  const seats_by_party = point.seats_by_party
  party_bar_chart.plot(seats_by_party)
  // TODO: this is used again inside interact_with_legend (nested)
  // pass it in instead
  const bar_values = all_coalition_seats(seats_by_party)
  coalition_bar_chart.plot(bar_values)
  plot_voter_canvas(simulation_canvas, voter_canvas, point)
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