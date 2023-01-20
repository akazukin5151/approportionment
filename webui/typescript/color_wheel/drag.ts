// TODO: copied from plot/party

import { clear_canvas } from "../canvas"
import { angle_of_point } from "../colormap_nd/angle"
import { pointer_pct_to_grid, pointer_to_pct } from "../convert_locations"
import { Dimension, GridCoords } from "../types"

let dragging: number | null = null

export function on_drag_start(
  ctx: CanvasRenderingContext2D,
  event: Event,
  party_coords: Array<GridCoords>,
  plotter: (angle: number) => void
): void {
  const l = (e: Event): void => on_drag_move(ctx, e, plotter, party_coords)
  event.target!.addEventListener('mousemove', l)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', l)
    dragging = null
    if (document.body.style.cursor === 'grabbing') {
      document.body.style.cursor = 'grab'
    }
  })
}

function on_drag_move(
  ctx: CanvasRenderingContext2D,
  event: Event,
  plotter: (angle: number) => void,
  party_coords: Array<GridCoords>,
): void {
  const evt = event as MouseEvent
  const pointer_coords = pointer_pct_to_grid(pointer_to_pct(evt))
  if (dragging === null) {
    dragging = find_hovered_party(pointer_coords, party_coords)
  }

  if (dragging !== null) {
    document.body.style.cursor = 'grabbing'
    const angle_of_pointer = angle_of_point(pointer_coords)
    // we want to get the angle of the first party dot
    // the angle of this party is also the angle from the first party to
    // this party
    // so the angle of the pointer is made up of the angle of the first party
    // plus the angle from the first party to this party
    const angle_of_this_party = (dragging / party_coords.length) * (2 * Math.PI)
    const angle_of_first_party = angle_of_pointer - angle_of_this_party

    clear_canvas(ctx)
    plotter(angle_of_first_party)
  }

}

function find_hovered_party(
  pointer: GridCoords,
  party_coords: Array<GridCoords>
): number | null {
  return party_coords
    .map((x, i) => ({ x, i }))
    .find(({ x: coord }) => {
      const dist = Math.sqrt(
        (pointer.grid_x - coord.grid_x) ** 2
        + (pointer.grid_y - coord.grid_y) ** 2
      )
      return dist <= 0.4
    })
    ?.i
    ?? null
}

// Different canvas
function get_canvas_dimensions(): Dimension {
  const canvas = document.getElementById('color-wheel')!
  return { width: canvas.clientWidth, height: canvas.clientHeight }
}

