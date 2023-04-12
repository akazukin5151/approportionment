import { Canvas, AllCanvases } from "../../../types/canvas";
import { Party } from "../../../types/election";
import { find_hovered_party } from "../../hover/hovered_party"
import {
  clear_coalition_seats,
  get_canvas_dimensions
} from "../../../form";
import { party_manager, set_party_changed } from "../../../cache";
import { pointer_pct_to_grid, pointer_to_pct } from "../../../convert_locations";
import { abstract_on_drag_move, abstract_on_drag_start } from "../../../drag";
import { clear_legend_highlight } from "../../../td";
import { PARTY_CANVAS_SIZE } from "../../../constants";
import { hide_voter_canvas } from "../utils";
import { plot_voronoi, voronoi_enabled } from "../../../setup/setup_voronoi";
import { PartyManager } from "../../../party";

let dragging: Party | null = null

export function on_drag_start(
  all_canvases: AllCanvases,
  event: Event,
  plotter: (party_canvas: Canvas, party: Party) => void
): void {
  const l = (e: Event): void => on_drag_move(all_canvases, e, plotter)
  abstract_on_drag_start(event, l, () => dragging = null)
}

function on_drag_move(
  all_canvases: AllCanvases,
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
    (evt) => on_drag_move_inner(all_canvases, plotter, evt)
  )
}

function on_drag_move_inner(
  all_canvases: AllCanvases,
  plotter: (canvas: Canvas, party: Party) => void,
  evt: MouseEvent
): void {
  const { party: party_canvas, voter } = all_canvases
  document.body.style.cursor = 'grabbing'
  const { x_pct, y_pct } = pointer_to_pct(evt)
  const { grid_x, grid_y } = pointer_pct_to_grid({ x_pct, y_pct })
  dragging = { ...dragging!, x_pct, y_pct, grid_x, grid_y }
  // different dimensions
  party_canvas.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  hide_voter_canvas(all_canvases, voter)
  if (voronoi_enabled()) {
    plot_voronoi(all_canvases.voronoi.ctx)
  }
  party_manager.update_pct(dragging.num, { x_pct, y_pct })
  party_manager.parties.forEach(party => plotter(party_canvas, party))
  clear_coalition_seats()
  clear_legend_highlight()
  set_party_changed(true)
}
