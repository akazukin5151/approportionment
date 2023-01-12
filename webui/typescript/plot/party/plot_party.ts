import { Party, PartyPlotInfo } from "../../types";
import { on_pointer_move } from './hover'
import { party_to_ppi } from "./utils";
import { on_drag_start } from './drag/drag'
import { load_parties } from "../../load_parties";
import { Canvas } from "../../canvas";

export let ppi: Array<PartyPlotInfo> = []

function plot_single_party(canvas: Canvas, party: Party) {

  canvas.ctx.beginPath()
  canvas.ctx.arc(party.x_pct * 200, party.y_pct * 200, 10, 0, Math.PI * 2, true)
  canvas.ctx.closePath()
  canvas.ctx.fillStyle = party.color
  canvas.ctx.fill()
}

export function plot_party_core(canvas: Canvas, parties: Array<Party>): void {
  canvas.clear_canvas()

  parties.forEach(party => plot_single_party(canvas, party))

  //ppi = parties.map(party_to_ppi)

  //ppi.forEach(p => canvas.plot_square_with_border(p))

  canvas.addEventListener('mousemove', on_pointer_move)
  canvas.addEventListener('mousedown', e => on_drag_start(canvas, e))

  //canvas.putImageData()
}

export function plot_party_from_table(canvas: Canvas): void {
  const parties = load_parties();
  plot_party_core(canvas, parties)
}
