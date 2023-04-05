import { CANDIDATE_BASED_METHODS } from '../constants'
import { get_form_input } from '../form'
import { create_text_td } from '../td'
import { AllCanvases } from '../types/canvas'
import { create_coalition_select_td } from './coalition'
import { create_generate_button } from './random_point'
import {
  create_color_picker_td,
  create_delete_button_td,
  create_seat_td,
  create_subtle_input_td,
} from './td'

export function generic_new_row(
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement,
  color: string,
  grid_x: number,
  grid_y: number,
  next_party_num: number,
  worker: Worker,
): HTMLSelectElement {
  const row = document.createElement('tr')
  row.appendChild(create_text_td(next_party_num))
  row.appendChild(create_color_picker_td(color, all_canvases))
  row.appendChild(create_subtle_input_td(grid_x.toFixed(2), all_canvases))
  row.appendChild(create_subtle_input_td(grid_y.toFixed(2), all_canvases))
  row.appendChild(create_seat_td())
  const select = create_coalition_select(all_canvases, row)
  create_buttons(all_canvases, row, worker)

  tbody.appendChild(row)
  return select
}

function create_coalition_select(
  all_canvases: AllCanvases,
  row: HTMLTableRowElement
): HTMLSelectElement {
  const coalition_td = document.createElement('td')
  const select = create_coalition_select_td(all_canvases.simulation)
  coalition_td.appendChild(select)
  row.appendChild(coalition_td)
  return select

}

function create_buttons(
  all_canvases: AllCanvases,
  row: HTMLTableRowElement,
  worker: Worker
): void {
  const value = get_form_input(null, 'method').value
  const btn_td = create_delete_button_td(all_canvases)
  const generate_btn = create_generate_button(row, worker, value)
  btn_td.appendChild(generate_btn)
  btn_td.className = 'party-table-btn-td'
  if (CANDIDATE_BASED_METHODS.includes(value)) {
    btn_td.style.display = 'flex'
  }
  row.appendChild(btn_td)
}

