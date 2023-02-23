import { on_color_picker_change } from './utils';
import { create_delete_button_td_with_cb } from '../td'
import { delete_party } from './delete_party';
import { coalitions_from_table } from '../form';
import { AllCanvases, Canvas } from '../types/canvas';
import { replot } from '../plot/replot';

export function create_color_picker_td(
  color: string,
  all_canvases: AllCanvases,
  next_party_num: number
): HTMLTableCellElement {
  const color_picker = document.createElement('input')
  color_picker.setAttribute('type', "color")
  color_picker.value = color
  color_picker.addEventListener(
    'change',
    (evt) => on_color_picker_change(all_canvases, next_party_num, evt)
  )
  const color_picker_td = document.createElement('td')
  color_picker_td.appendChild(color_picker)
  return color_picker_td
}

export function create_coalition_select_td(
  simulation_canvas: Canvas
): HTMLTableCellElement {
  const coalition_td = document.createElement('td')
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

  select.addEventListener('change',
    (evt) => on_coalition_set(simulation_canvas, evt)
  )
  coalition_td.appendChild(select)
  return coalition_td
}

function on_coalition_set(simulation_canvas: Canvas, evt: Event): void {
  // only replot if the new coalition is set to be colorized by
  const coalition_select = evt.target as HTMLSelectElement
  const coalition_to_colorize = coalition_select.value
  const group = document.getElementById('coalition-group')!
  const selected_coalition = Array.from(group.children).find(elem => {
    const opt = elem as HTMLOptionElement
    return opt.selected
  })
  if (selected_coalition) {
    const text = (selected_coalition as HTMLElement).innerText
    const num = text.slice('Coalition '.length)
    if (num === coalition_to_colorize) {
      replot(simulation_canvas)
    }
  }
}

export function create_delete_button_td(
  all_canvases: AllCanvases
): HTMLTableCellElement {
  return create_delete_button_td_with_cb(evt => delete_party(all_canvases, evt))
}

export function create_seat_td(): HTMLTableCellElement {
  const td = document.createElement('td')
  td.className = 'p-rel'

  const p = document.createElement('p')
  p.className = 'sparkline-label'
  td.appendChild(p)

  const sparkline = document.createElement('div')
  sparkline.className = 'sparkline'
  td.appendChild(sparkline)

  return td
}
