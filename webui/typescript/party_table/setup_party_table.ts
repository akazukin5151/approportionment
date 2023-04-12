import { add_party } from '.';
import { PartyManager } from '../party';
import { random_between, random_color, round_1dp } from '../random';
import { AllCanvases } from '../types/canvas';

export function setup_add_party(all_canvases: AllCanvases, pm: PartyManager): void {
  const btn = document.getElementById('add-party-button')!
  btn.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))
    const num = pm.next_party_num()
    add_party(pm, x, y, color, num, all_canvases)
  })
}

