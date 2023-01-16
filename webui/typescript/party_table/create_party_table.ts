import { create_text_td } from '../td'
import { Canvas } from '../types'
import {
  create_coalition_select_td,
  create_color_picker_td,
  create_delete_button_td,
  create_radio_td,
} from './td'
import { find_next_party_num } from './utils'

export function generic_new_row(
  party_canvas: Canvas,
  simulation_canvas: Canvas,
  tbody: HTMLTableSectionElement,
  set_radio_checked: boolean,
  color: string,
  grid_x: number,
  grid_y: number
): number {
  const next_party_num = find_next_party_num(tbody)

  const row = document.createElement('tr')
  row.appendChild(create_radio_td(simulation_canvas, set_radio_checked))
  row.appendChild(create_text_td(next_party_num))
  row.appendChild(create_color_picker_td(color, party_canvas, next_party_num))
  row.appendChild(create_text_td(grid_x.toFixed(2)))
  row.appendChild(create_text_td(grid_y.toFixed(2)))
  // Seats col - empty for now
  row.appendChild(document.createElement('td'))
  row.appendChild(create_coalition_select_td())
  row.appendChild(create_delete_button_td(party_canvas))

  tbody.appendChild(row)
  return next_party_num
}
