import { Canvas, Party } from "../../types";
import { on_pointer_move } from './hover'
import { on_drag_start } from './drag/drag'
import { clear_canvas } from "../../canvas";
import { RADIUS } from "../../constants";

export function plot_single_party(canvas: Canvas, party: Party) {
  canvas.ctx.beginPath()
  canvas.ctx.arc(party.x_pct * 200, party.y_pct * 200, RADIUS, 0, Math.PI * 2, true)
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
  clear_canvas(canvas)
  parties.forEach(party => plot_single_party(canvas, party))
  canvas.elem.addEventListener('mousemove', on_pointer_move)
  canvas.elem.addEventListener(
    'mousedown',
    e => on_drag_start(canvas, e, plot_single_party)
  )
}

