import { add_party } from '.';
import { party_manager } from '../cache';
import { CANDIDATE_BASED_METHODS } from '../constants';
import { PartyManager } from '../party';
import { random_color } from '../random';
import { AllCanvases } from '../types/canvas';
import { XY } from '../types/position';
import { RngArgs } from '../types/wasm';

export function create_generate_button(
  row: HTMLTableRowElement,
  worker: Worker,
  value: string
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.innerText = 'Add near'
  btn.className = 'near-btn'
  btn.title = 'Generate a random candidate near this point'
  if (!CANDIDATE_BASED_METHODS.includes(value)) {
    btn.style.display = 'none'
  }

  btn.addEventListener('click', () => on_near_click(row, worker))
  return btn
}

function on_near_click(row: HTMLTableRowElement, worker: Worker): void {
  const x = (row.children[2]?.children[0] as HTMLInputElement).value
  const y = (row.children[3]?.children[0] as HTMLInputElement).value
  const coalition_num = (row.children[5]?.children[0] as HTMLInputElement).value
  const msg: RngArgs = {
    mean_x: parseFloat(x),
    mean_y: parseFloat(y),
    stdev: 0.1,
    coalition_num
  }
  worker.postMessage(msg)
}

export function handle_random_point(
  point: XY,
  coalition_num: string,
  all_canvases: AllCanvases,
): void {
  const color = random_color()
  const num = party_manager.next_party_num()
  const select = add_party(party_manager, point.x, point.y, color, num, all_canvases)
  // select.value = coalition_num
}
