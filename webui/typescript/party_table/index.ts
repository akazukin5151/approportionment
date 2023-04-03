import { add_to_colorize_by, load_parties } from '../form'
import { plot_parties } from '../plot/party/plot_party'
import { AllCanvases } from '../types/canvas'
import { generic_new_row } from './create_party_table'

export function add_party(
  x: number,
  y: number,
  color: string,
  idx: number,
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement,
  worker: Worker
): HTMLSelectElement {
  const select = generic_new_row(all_canvases, tbody, color, x, y, idx, worker)
  const parties = load_parties()
  plot_parties(all_canvases.party, parties)
  add_to_colorize_by('Party', idx)
  return select
}


