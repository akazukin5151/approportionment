import { Party } from "../../types";
import { on_pointer_move } from './hover'
import { on_drag_start } from './drag/drag'
import { Canvas } from "../../canvas";

export function plot_single_party(canvas: Canvas, party: Party) {
  canvas.ctx.beginPath()
  canvas.ctx.arc(party.x_pct * 200, party.y_pct * 200, 10, 0, Math.PI * 2, true)
  canvas.ctx.closePath()
  canvas.ctx.fillStyle = party.color
  canvas.ctx.fill()
}

export function plot_party_with_listeners(
  canvas: Canvas,
  parties: Array<Party>
): void {
  canvas.clear_canvas()
  parties.forEach(party => plot_single_party(canvas, party))
  canvas.addEventListener('mousemove', on_pointer_move)
  canvas.addEventListener('mousedown', e => on_drag_start(canvas, e))
}

