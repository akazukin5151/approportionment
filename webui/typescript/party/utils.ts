import { cache } from '../cache'
import { plot_party_on_wheel } from '../color_wheel/plot'
import { PARTY_CANVAS_SIZE } from '../constants'
import { PartyManager } from '../party'
import { plot_parties } from '../plot/party/plot_party'
import { hide_voter_canvas } from '../plot/party/utils'
import { plot_voronoi, voronoi_enabled } from '../setup/setup_voronoi'
import { AllCanvases } from '../types/canvas'

export function replot_parties(
  all_canvases: AllCanvases,
  pm: PartyManager,
): void {
  const parties = pm.parties
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

