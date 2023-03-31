import { create_text_td } from '../td'
import { AllCanvases } from '../types/canvas'
import {
  create_coalition_select_td,
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
  next_party_num: number
): number {
  const row = document.createElement('tr')
  row.appendChild(create_text_td(next_party_num))
  row.appendChild(create_color_picker_td(color, all_canvases))
  row.appendChild(create_subtle_input_td(grid_x.toFixed(2), all_canvases))
  row.appendChild(create_subtle_input_td(grid_y.toFixed(2), all_canvases))
  row.appendChild(create_seat_td())
  row.appendChild(create_coalition_select_td(all_canvases.simulation))
  row.appendChild(create_delete_button_td(all_canvases))

  tbody.appendChild(row)
  return next_party_num
}

