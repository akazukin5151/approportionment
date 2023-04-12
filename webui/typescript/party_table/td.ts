import { replot_parties, update_party_on_wheel } from './utils';
import {
  clear_coalition_seats,
} from '../form';
import { clear_legend_highlight, clear_party_seats_td, create_delete_button_td_with_cb } from '../td'
import { delete_party } from './delete_party';
import { AllCanvases } from '../types/canvas';
import { set_party_changed } from '../cache';

export function create_subtle_input_td(
  value: string,
  all_canvases: AllCanvases,
): HTMLTableCellElement {
  const td = document.createElement('td')
  const input = document.createElement('input')
  input.className = 'subtle-input'
  input.type = 'number'
  input.min = '-1'
  input.max = '1'
  input.step = '0.01'
  input.value = value
  // input.addEventListener('input', () => {
  //   replot_parties(all_canvases)
  //   parties_from_table().forEach(tr => {
  //     clear_party_seats_td(tr)
  //   })
  //   clear_coalition_seats()
  //   clear_legend_highlight()
  //   set_party_changed(true)
  // })
  td.appendChild(input)
  return td
}

export function create_color_picker_td(
  color: string,
  all_canvases: AllCanvases,
): HTMLTableCellElement {
  const color_picker = document.createElement('input')
  color_picker.setAttribute('type', "color")
  color_picker.value = color
  // color_picker.addEventListener('change', () => {
  //   replot_parties(all_canvases)
  //   update_party_on_wheel()
  // })
  const color_picker_td = document.createElement('td')
  color_picker_td.appendChild(color_picker)
  return color_picker_td
}

export function create_delete_button_td(
  all_canvases: AllCanvases
): void {
  //return create_delete_button_td_with_cb(evt => delete_party(all_canvases, evt))
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
