import { AllCanvases } from '../types/canvas'
import { coalition_bar_chart, party_bar_chart, party_manager } from '../cache';
import { random_between, random_color, round_1dp } from '../random';
import { clear_legend_highlight } from '../td';
import { add_party } from '../party/add_party';
import { clear_canvas } from '../canvas';

export function setup_add_party(all_canvases: AllCanvases): void {
  const btn = document.getElementById('add-party-button')!
  btn.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))
    const num = party_manager.next_party_num()
    clear_canvas(all_canvases.party.ctx, true)
    add_party(party_manager, x, y, color, num, all_canvases, null, null)
    // TODO: copied
    party_bar_chart.zero()
    coalition_bar_chart.zero()
    clear_legend_highlight()
    party_manager.party_changed = true
  })
}

