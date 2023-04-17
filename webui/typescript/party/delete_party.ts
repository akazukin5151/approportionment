import { party_bar_chart } from '../cache'
import { PARTY_CANVAS_SIZE } from '../constants'
import { clear_coalition_seats } from '../form'
import { PartyManager } from '../party'
import { plot_single_party } from '../plot/party/plot_party'
import { plot_voronoi, voronoi_enabled } from '../setup/setup_voronoi'
import { clear_legend_highlight } from '../td'
import { AllCanvases } from '../types/canvas'

// TODO: there is only one way to delete a party and that is the popup
// move things around
export function delete_party(
  pm: PartyManager,
  num: number,
  all_canvases: AllCanvases
): void {
  pm.delete(num)
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  pm.parties.forEach(party => plot_single_party(all_canvases.party, party))
  party_bar_chart.delete_bar(num)
  party_bar_chart.zero()
  clear_coalition_seats()
  clear_legend_highlight()
  if (voronoi_enabled()) {
    plot_voronoi(all_canvases.voronoi.ctx)
  }
  pm.party_changed = true
}

