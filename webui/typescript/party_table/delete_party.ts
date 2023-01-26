import { set_party_changed } from '../cache'
import { PARTY_CANVAS_SIZE } from '../constants'
import { load_parties, clear_coalition_seats } from '../form'
import { plot_single_party } from '../plot/party/plot_party'
import { plot_voronoi } from '../setup/setup_voronoi'
import { clear_legend_highlight, clear_party_seats_td } from '../td'
import { AllCanvases } from '../types/app'

export function delete_party(all_canvases: AllCanvases, ev: MouseEvent): void {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num_td = tr.children[1] as HTMLElement
    const party_num = parseInt(num_td.innerText)
    const parties = load_parties()
    const idx = parties.findIndex(p => p.num === party_num)
    if (idx !== -1) {
      parties.splice(idx, 1)
      // Different dimensions
      all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
      parties.forEach(party => plot_single_party(all_canvases.party, party))
      reselect_radio(tr)
      clear_party_seats(tr)
      clear_coalition_seats()
      clear_legend_highlight()
      tr.remove()
      plot_voronoi(all_canvases.voronoi.ctx)
      set_party_changed(true)
    }
  }
}

/** Reselect the radio if the party to delete has a checked radio **/
function reselect_radio(parent: Element): void {
  const radio_td = parent.children[0]
  const radio = radio_td?.children[0] as HTMLInputElement
  if (!radio.checked) {
    return
  }
  const prev_row = parent.previousSibling as Element | null
  const prev_row_children = prev_row?.children
  if (prev_row_children) {
    return set_radio_from_row(prev_row_children)
  }
  // otherwise, try the next sibling
  const next_row = parent.nextSibling as Element | null
  const next_row_children = next_row?.children
  if (next_row_children) {
    set_radio_from_row(next_row_children)
  }
}

function set_radio_from_row(row: HTMLCollection): void {
  const radio = row[0]!.children[0]
  if (radio) {
    (radio as HTMLInputElement).checked = true
  }
}

function clear_party_seats(tr: Element): void {
  const tbody = tr.parentNode!
  Array.from(tbody.children).forEach(clear_party_seats_td)
}

