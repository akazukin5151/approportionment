import { create_text_td } from '../td'
import { AllCanvases } from '../types/app'
import {
  create_coalition_select_td,
  create_color_picker_td,
  create_delete_button_td,
  create_radio_td,
  create_seat_td,
} from './td'
import { find_next_party_num } from './utils'

export function generic_new_row(
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement,
  set_radio_checked: boolean,
  color: string,
  grid_x: number,
  grid_y: number
): number {
  const next_party_num = find_next_party_num(tbody)

  const row = document.createElement('tr')
  row.appendChild(create_radio_td(all_canvases, set_radio_checked))
  row.appendChild(create_text_td(next_party_num))
  row.appendChild(create_color_picker_td(color, all_canvases, next_party_num))
  row.appendChild(create_text_td(grid_x.toFixed(2)))
  row.appendChild(create_text_td(grid_y.toFixed(2)))
  row.appendChild(create_seat_td())
  row.appendChild(create_coalition_select_td())
  row.appendChild(create_delete_button_td(all_canvases.party))

  tbody.appendChild(row)
  return next_party_num
}

