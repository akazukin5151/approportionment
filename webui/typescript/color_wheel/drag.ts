import { clear_canvas } from "../canvas"
import { angle_of_point } from "../trig"
import { TAU } from "../constants"
import { pointer_pct_to_grid, pointer_to_pct } from "../convert_locations"
import { abstract_on_drag_move, abstract_on_drag_start } from "../drag"
import { GridCoords } from "../types/position"
import { find_hovered_party } from "./hovered_party"

let dragging: number | null = null

export function on_drag_start(
  ctx: CanvasRenderingContext2D,
  event: Event,
  party_coords: Array<GridCoords>,
  plotter: (angle: number) => void
): void {
  const l = (e: Event): void => on_drag_move(ctx, e, plotter, party_coords)
  abstract_on_drag_start(event, l, () => dragging = null)
}

function on_drag_move(
  ctx: CanvasRenderingContext2D,
  event: Event,
  plotter: (angle: number) => void,
  party_coords: Array<GridCoords>,
): void {
  abstract_on_drag_move(
    event,
    (evt) => {
      const pointer_coords = pointer_pct_to_grid(pointer_to_pct(evt))
      dragging = find_hovered_party(pointer_coords, party_coords)
    },
    () => dragging,
    (evt) => {
      const pointer_coords = pointer_pct_to_grid(pointer_to_pct(evt))
      document.body.style.cursor = 'grabbing'
      const angle_of_pointer = angle_of_point(pointer_coords)
      // we want to get the angle of the first party dot
      // the angle of this party is also the angle from the first party to
      // this party
      // so the angle of the pointer is made up of the angle of the first party
      // plus the angle from the first party to this party
      const angle_of_this_party = (dragging! / party_coords.length) * TAU
      const angle_of_first_party = angle_of_pointer - angle_of_this_party

      clear_canvas(ctx)
      plotter(angle_of_first_party)
    }
  )

}

