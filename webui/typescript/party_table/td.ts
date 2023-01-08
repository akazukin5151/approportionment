import * as PIXI from 'pixi.js'
import { color_num_to_string } from '../utils';
import { get_all_coalition_tr } from '../coalition_table';
import { delete_party, update_color_picker } from './utils';

export function create_radio_td(set_radio_checked: boolean): HTMLTableCellElement {
  const radio_input = document.createElement('input')
  radio_input.setAttribute('type', "radio")
  radio_input.setAttribute('class', 'party_radio')
  radio_input.setAttribute('name', 'party_radio')
  if (set_radio_checked) {
    radio_input.checked = true
  }
  const radio_td = document.createElement('td')
  radio_td.appendChild(radio_input)
  return radio_td
}

export function find_next_party_num(tbody: HTMLTableSectionElement): number {
  const party_numbers = Array.from(tbody.children)
    .filter((_, idx) => idx !== 0)
    .map(row => {
      const td = row.children[1] as HTMLElement
      return parseInt(td.innerText)
    })
  // Ensure there is at least one item in the array
  // The only item will be a 0 in that case
  party_numbers.push(-1)
  const max_party_num = Math.max(...party_numbers)
  return max_party_num + 1
}

export function create_color_picker_td(
  color: number,
  stage: PIXI.Container,
  next_party_num: number
) {
  const color_picker = document.createElement('input')
  color_picker.setAttribute('type', "color")
  color_picker.value = color_num_to_string(color)
  color_picker.addEventListener(
    'change',
    (evt) => update_color_picker(stage, next_party_num, evt)
  )
  const color_picker_td = document.createElement('td')
  color_picker_td.appendChild(color_picker)
  return color_picker_td
}

export function create_text_td(n: number): HTMLTableCellElement {
  const td = document.createElement('td')
  td.appendChild(document.createTextNode(n.toString()))
  return td
}

export function create_coalition_select_td(): HTMLTableCellElement {
  const coalition_td = document.createElement('td')
  const select = document.createElement('select')
  select.className = 'select-coalition'
  // Add a blank option
  const option = document.createElement('option')
  select.appendChild(option)
  // Then add the coalitions from the coalition table
  const coalition_nums = get_all_coalition_tr()
    .map(row => (row.children[0] as HTMLElement).innerText)
  for (const coalition_num of coalition_nums) {
    const option = document.createElement('option')
    option.text = coalition_num
    option.value = coalition_num
    select.appendChild(option)
  }
  coalition_td.appendChild(select)
  return coalition_td
}

export function create_delete_button_td(stage: PIXI.Container): HTMLTableCellElement {
  const btn_td = document.createElement('td')
  const delete_btn = document.createElement('button')
  delete_btn.innerText = 'Delete'
  delete_btn.onclick = evt => delete_party(stage, evt)
  btn_td.appendChild(delete_btn)
  return btn_td
}
