import { Canvas, Party } from "../../../types/core";
import { update_party_table } from "./form";
import { find_hovered_party } from "../../hover/hovered_party"
import {
  load_parties,
  clear_coalition_seats,
  get_canvas_dimensions
} from "../../../form";
import { clear_canvas } from "../../../canvas";
import { set_party_changed } from "../../../cache";
import { pointer_pct_to_grid, pointer_to_pct } from "../../../convert_locations";
import { abstract_on_drag_move, abstract_on_drag_start } from "../../../drag";
import { clear_legend_highlight } from "../../../td";
import { PARTY_CANVAS_SIZE } from "../../../constants";

let dragging: Party | null = null

export function on_drag_start(
  canvas: Canvas,
  event: Event,
  plotter: (canvas: Canvas, party: Party) => void
): void {
  const l = (e: Event): void => on_drag_move(canvas, e, plotter)
  abstract_on_drag_start(event, l, () => dragging = null)
}

function on_drag_move(
  canvas: Canvas,
  event: Event,
  plotter: (canvas: Canvas, party: Party) => void
): void {
  abstract_on_drag_move(
    event,
    (evt) => {
      dragging =
        find_hovered_party(evt.offsetX, evt.offsetY, get_canvas_dimensions())
    },
    () => dragging,
    (evt) => on_drag_move_inner(canvas, plotter, evt)
  )
}

function on_drag_move_inner(
  canvas: Canvas,
  plotter: (canvas: Canvas, party: Party) => void,
  evt: MouseEvent
): void {
  document.body.style.cursor = 'grabbing'
  const { x_pct, y_pct } = pointer_to_pct(evt)
  const { grid_x, grid_y } = pointer_pct_to_grid({ x_pct, y_pct })
  dragging = { ...dragging!, x_pct, y_pct, grid_x, grid_y }
  // different dimensions
  canvas.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  load_parties().forEach(party => plotter(canvas, party))
  update_party_table({ x_pct, y_pct }, dragging.num)
  clear_coalition_seats()
  clear_legend_highlight()
  set_party_changed(true)
}
