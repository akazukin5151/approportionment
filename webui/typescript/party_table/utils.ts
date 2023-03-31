import { cache } from '../cache'
import { plot_party_on_wheel } from '../color_wheel/plot'
import { PARTY_CANVAS_SIZE } from '../constants'
import { load_parties } from '../form'
import { plot_parties, plot_party_with_listeners } from '../plot/party/plot_party'
import { hide_voter_canvas } from '../plot/party/utils'
import { plot_voronoi, voronoi_enabled } from '../setup/setup_voronoi'
import { AllCanvases } from '../types/canvas'

export function replot_parties(
  all_canvases: AllCanvases,
): void {
  const parties = load_parties()
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  hide_voter_canvas(all_canvases, all_canvases.voter)
  plot_parties(all_canvases.party, parties)
  if (voronoi_enabled()) {
    plot_voronoi(all_canvases.voronoi.ctx)
  }
  if (cache) {
    cache.parties = parties
  }
}

export function update_party_on_wheel(): void {
    if (cache) {
      const legend_table = document.getElementById('legend-table') as HTMLElement
      const header_tr = legend_table.children[1]?.children[0]
      const quantity_td = header_tr?.children[1] as HTMLElement
      const quantity_name = quantity_td.innerText
      if (quantity_name === 'Party') {
        plot_party_on_wheel(cache)
      }
    }
}

export function find_next_party_num(tbody: HTMLTableSectionElement): number {
  const party_numbers = Array.from(tbody.children)
    .map(row => {
      const td = row.children[0] as HTMLElement
      return parseInt(td.innerText)
    })
  // Ensure there is at least one item in the array
  // The only item will be a 0 in that case
  party_numbers.push(-1)
  const max_party_num = Math.max(...party_numbers)
  return max_party_num + 1
}
