import { Canvas } from '../types/canvas';
import { replot } from '../plot/replot';
import { coalitions_from_table } from '../form';

export function create_coalition_select_td(
  simulation_canvas: Canvas
): HTMLSelectElement {
  const select = document.createElement('select')
  select.className = 'select-coalition'

  // Add a blank option
  const option = document.createElement('option')
  select.appendChild(option)

  // Then add the coalitions from the coalition table
  const coalition_nums = coalitions_from_table()
    .map(row => (row.children[0] as HTMLElement).innerText)
  for (const coalition_num of coalition_nums) {
    const option = document.createElement('option')
    option.text = coalition_num
    option.value = coalition_num
    select.appendChild(option)
  }

  select.addEventListener('change', () => on_coalition_set(simulation_canvas))
  return select
}

function on_coalition_set(simulation_canvas: Canvas): void {
  // only replot if we are colouring by coalition
  // can't check for exact coalition number because switching a party
  // from a colorized to a non-colorized coalition will not replot
  const group = document.getElementById('coalition-group')!
  const selected_coalition = Array.from(group.children).find(elem => {
    const opt = elem as HTMLOptionElement
    return opt.selected
  })
  if (selected_coalition) {
    replot(simulation_canvas)
  }
}

