import { Canvas, Party } from "../../types/core";
import { on_pointer_move } from '../hover/hover'
import { on_drag_start } from './drag/drag'
import { clear_canvas } from "../../canvas";
import { CANVAS_SIDE, PARTY_RADIUS, TAU } from "../../constants";

export function plot_single_party(canvas: Canvas, party: Party): void {
  canvas.ctx.beginPath()
  canvas.ctx.arc(
    party.x_pct * CANVAS_SIDE, party.y_pct * CANVAS_SIDE, PARTY_RADIUS, 0, TAU, true
  )
  canvas.ctx.closePath()
  canvas.ctx.fillStyle = party.color
  canvas.ctx.fill()
  canvas.ctx.strokeStyle = '#ffffff'
  canvas.ctx.lineWidth = 2
  canvas.ctx.stroke()
}

export function plot_party_with_listeners(
  party_canvas: Canvas,
  simulation_canvas: Canvas,
  voter_canvas: Canvas,
  parties: Array<Party>,
): void {
  clear_canvas(party_canvas.ctx)
  parties.forEach(party => plot_single_party(party_canvas, party))
  party_canvas.elem.addEventListener('mousemove',
    e => on_pointer_move(simulation_canvas, voter_canvas, e)
  )
  party_canvas.elem.addEventListener(
    'mousedown',
    e => on_drag_start(party_canvas, e, plot_single_party)
  )
  party_canvas.elem.addEventListener('mouseleave', () => {
    simulation_canvas.elem.style.filter = ''
    voter_canvas.elem.style.display = 'none'
  })
}

