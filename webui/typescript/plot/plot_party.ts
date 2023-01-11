import { Canvas, Party, PartyPlotInfo } from "../types";
import { load_parties } from '../load_parties'
import { on_pointer_move } from './hover'
import { CanvasPlotter } from "./canvas_plotter";
import { party_to_ppi } from "./utils";
import {on_drag_start} from './drag'

export let ppi: Array<PartyPlotInfo> = []

export function plot_party_core(canvas: Canvas, parties: Array<Party>): void {
  for (let i = 0; i < canvas.image_data.data.length; i += 4) {
    canvas.image_data.data[i + 4] = 0
  }

  // TODO: add white border around party
  ppi = parties.map(party_to_ppi)

  const plt = new CanvasPlotter(200, 200)
  ppi.forEach(p => plt.plot_square(canvas.image_data, p))

  canvas.elem.addEventListener('mousemove', on_pointer_move)
  canvas.elem.addEventListener('mousedown', e => on_drag_start(canvas, e))

  canvas.ctx.putImageData(canvas.image_data, 0, 0)
}

export function plot_default(canvas: Canvas): void {
  const parties = load_parties();
  plot_party_core(canvas, parties)
}
