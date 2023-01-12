import { Party } from './types';
import { grid_x_to_pct, grid_y_to_pct } from './utils';

export function load_parties(): Array<Party> {
  const table = document.getElementById('party-table')!
  const tbody = table.children[0]!
  return Array.from(tbody.children).slice(1).map((tr) => {
    const grid_x = parseFloat((tr.children[3] as HTMLElement).innerText)
    const grid_y = parseFloat((tr.children[4] as HTMLElement).innerText)
    const color_td = (tr.children[2] as HTMLElement)
    const color_input = color_td.children[0] as HTMLInputElement
    return {
      x_pct: grid_x_to_pct(grid_x),
      y_pct: grid_y_to_pct(grid_y),
      grid_x,
      grid_y,
      color: color_input.value,
      num: parseInt((tr.children[1] as HTMLElement).innerText)
    }
  })
    .sort((a, b) => a.num - b.num)
}
