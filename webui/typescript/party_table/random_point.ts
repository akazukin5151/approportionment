import { add_party } from '.';
import { random_color } from '../random';
import { AllCanvases } from '../types/canvas';
import { XY } from '../types/position';
import { RngArgs } from '../types/wasm';
import { find_next_party_num } from './utils';

export function create_generate_button(
  row: HTMLTableRowElement,
  worker: Worker,
  value: string
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.innerText = 'Add near'
  btn.className = 'near-btn'
  btn.title = 'Generate a random candidate near this point'
  if (value !== 'StvAustralia') {
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
  worker: Worker
): void {
  const table = document.getElementById('party-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;
  const color = random_color()
  const num = find_next_party_num(tbody)
  const select = add_party(point.x, point.y, color, num, all_canvases, tbody, worker)
  select.value = coalition_num
}
