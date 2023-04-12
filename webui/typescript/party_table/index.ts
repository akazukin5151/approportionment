import { add_to_colorize_by } from '../form'
import { PartyManager } from '../party'
import { plot_parties } from '../plot/party/plot_party'
import { AllCanvases } from '../types/canvas'

export function add_party(
  pm: PartyManager,
  x: number,
  y: number,
  color: string,
  idx: number,
  all_canvases: AllCanvases,
): void {
  pm.add(x, y, color, idx)
  plot_parties(all_canvases.party, pm.parties)
  add_to_colorize_by('Party', idx)
}

