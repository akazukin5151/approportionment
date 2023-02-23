import { set_party_changed } from '../cache'
import { PARTY_CANVAS_SIZE } from '../constants'
import { remove_from_colorize_by , load_parties, clear_coalition_seats } from '../form'
import { plot_single_party } from '../plot/party/plot_party'
import { plot_voronoi, voronoi_enabled } from '../setup/setup_voronoi'
import { clear_legend_highlight, clear_party_seats_td } from '../td'
import { AllCanvases } from '../types/canvas'

export function delete_party(all_canvases: AllCanvases, ev: MouseEvent): void {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num_td = tr.children[0] as HTMLElement
    const party_num = parseInt(num_td.innerText)
    const parties = load_parties()
    const idx = parties.findIndex(p => p.num === party_num)
    if (idx !== -1) {
      parties.splice(idx, 1)
      // Different dimensions
      all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
      parties.forEach(party => plot_single_party(all_canvases.party, party))
      remove_from_colorize_by('Party', party_num.toString())
      clear_party_seats(tr)
      clear_coalition_seats()
      clear_legend_highlight()
      tr.remove()
      if (voronoi_enabled()) {
        plot_voronoi(all_canvases.voronoi.ctx)
      }
      set_party_changed(true)
    }
  }
}

function clear_party_seats(tr: Element): void {
  const tbody = tr.parentNode!
  Array.from(tbody.children).forEach(clear_party_seats_td)
}

