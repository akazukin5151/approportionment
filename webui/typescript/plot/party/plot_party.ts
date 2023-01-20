import { Canvas, Party } from "../../types";
import { on_pointer_move } from '../hover/hover'
import { on_drag_start } from './drag/drag'
import { clear_canvas } from "../../canvas";
import { CANVAS_SIDE, RADIUS, TAU } from "../../constants";

export function plot_single_party(canvas: Canvas, party: Party): void {
  canvas.ctx.beginPath()
  canvas.ctx.arc(
    party.x_pct * CANVAS_SIDE, party.y_pct * CANVAS_SIDE, RADIUS, 0, TAU, true
  )
  canvas.ctx.closePath()
  canvas.ctx.fillStyle = party.color
  canvas.ctx.fill()
  canvas.ctx.strokeStyle = '#ffffff'
  canvas.ctx.lineWidth = 2
  canvas.ctx.stroke()
}

export function plot_party_with_listeners(
  canvas: Canvas,
  parties: Array<Party>
): void {
  clear_canvas(canvas.ctx)
  parties.forEach(party => plot_single_party(canvas, party))
  canvas.elem.addEventListener('mousemove', on_pointer_move)
  canvas.elem.addEventListener(
    'mousedown',
    e => on_drag_start(canvas, e, plot_single_party)
  )
}

