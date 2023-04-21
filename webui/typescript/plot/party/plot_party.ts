import { Canvas, } from "../../types/canvas";
import { Party } from "../../types/election";
import { clear_canvas } from "../../canvas";
import { PARTY_CANVAS_SIZE, PARTY_RADIUS, TAU } from "../../constants";

/** Use this function when event handlers are already set.
 * This prevents multiple callbacks being triggered and slowing down the site.
 * If they are not set yet, use plot_party_with_listeners instead */
export function plot_parties(party_canvas: Canvas, parties: Array<Party>): void {
  clear_canvas(party_canvas.ctx)
  parties.forEach(p => plot_single_party(party_canvas, p))
}

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

