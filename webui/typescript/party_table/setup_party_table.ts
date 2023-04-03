import { add_party } from '.';
import { random_between, random_color, round_1dp } from '../random';
import { AllCanvases } from '../types/canvas';
import { find_next_party_num } from './utils';

export function setup_party_table(all_canvases: AllCanvases, worker: Worker): void {
  const table = document.getElementById('party-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  const btn = document.getElementById('add-party-button')
  btn?.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))
    const num = find_next_party_num(tbody)

    add_party(x, y, color, num, all_canvases, tbody, worker)
  })
}

