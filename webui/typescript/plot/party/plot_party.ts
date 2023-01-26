import { Canvas, Party } from "../../types/core";
import { on_pointer_move } from '../hover/hover'
import { on_drag_start } from './drag/drag'
import { clear_canvas } from "../../canvas";
import { PARTY_CANVAS_SIZE, PARTY_RADIUS, TAU } from "../../constants";
import { AllCanvases } from "../../types/app";
import { hide_voter_canvas } from "./utils";

export function plot_single_party(canvas: Canvas, party: Party): void {
  const x = party.x_pct * PARTY_CANVAS_SIZE
  const y = party.y_pct * PARTY_CANVAS_SIZE
  canvas.ctx.beginPath()
  canvas.ctx.arc(x, y, PARTY_RADIUS, 0, TAU, true)
  canvas.ctx.closePath()
  canvas.ctx.fillStyle = party.color
  canvas.ctx.fill()
  canvas.ctx.strokeStyle = '#ffffff'
  canvas.ctx.lineWidth = 2
  canvas.ctx.stroke()
}

export function plot_party_with_listeners(
  all_canvases: AllCanvases,
  parties: Array<Party>,
): void {
  const { party, voter, simulation } = all_canvases
  clear_canvas(party.ctx)
  parties.forEach(p => plot_single_party(party, p))
  party.elem.addEventListener('mousemove',
    e => on_pointer_move(simulation, voter, e)
  )
  party.elem.addEventListener(
    'mousedown',
    e => on_drag_start(all_canvases, e, plot_single_party)
  )
  party.elem.addEventListener('mouseleave', () =>
    hide_voter_canvas(all_canvases, voter)
  )
}

