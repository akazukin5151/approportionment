import * as PIXI from 'pixi.js'
import { color_num_to_string, color_str_to_num } from './utils';
import { plot_single_party } from './plot_party'
import { InfoGraphics } from './types';
import { get_all_coalition_tr } from './coalition_table';

export function generic_new_row(
  stage: PIXI.Container,
  tbody: HTMLTableSectionElement,
  set_radio_checked: boolean,
  color: number,
  x: number,
  y: number
) {
  const row = document.createElement('tr')

  const radio_input = document.createElement('input')
  radio_input.setAttribute('type', "radio")
  radio_input.setAttribute('class', 'party_radio')
  radio_input.setAttribute('name', 'party_radio')
  if (set_radio_checked) {
    radio_input.checked = true
  }
  const radio_td = document.createElement('td')
  radio_td.appendChild(radio_input)
  row.appendChild(radio_td)

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
  const next_party_num = max_party_num + 1

  const num_td = document.createElement('td')
  num_td.appendChild(document.createTextNode(next_party_num.toString()))
  row.appendChild(num_td)

  const color_picker = document.createElement('input')
  color_picker.setAttribute('type', "color")
  color_picker.value = color_num_to_string(color)
  color_picker.addEventListener(
    'change',
    (evt) => update_color_picker(stage, next_party_num, evt)
  )
  const color_picker_td = document.createElement('td')
  color_picker_td.appendChild(color_picker)
  row.appendChild(color_picker_td)

  const x_td = document.createElement('td')
  x_td.appendChild(document.createTextNode(x.toString()))
  row.appendChild(x_td)

  const y_td = document.createElement('td')
  y_td.appendChild(document.createTextNode(y.toString()))
  row.appendChild(y_td)

  // Seats col - empty for now
  row.appendChild(document.createElement('td'))

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
  row.appendChild(coalition_td)

  const btn_td = document.createElement('td')
  const delete_btn = document.createElement('button')
  delete_btn.innerText = 'Delete'
  delete_btn.onclick = evt => delete_party(stage, evt)
  btn_td.appendChild(delete_btn)
  row.appendChild(btn_td)

  tbody.appendChild(row)

  return next_party_num
}

function delete_party(stage: PIXI.Container, ev: MouseEvent) {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num_td = tr.children[1] as HTMLElement
    const party_num = num_td.innerText
    const elems = stage.children;
    Array.from(elems).forEach(e => {
      if (e instanceof InfoGraphics && e.num === parseInt(party_num)) {
        e.destroy()
      }
    })
    reselect_radio(tr)
    tr.remove()
  }
}

// Reselect the radio if the party to delete has a checked radio
function reselect_radio(parent: Element) {
  const radio_td = parent.children[0]
  const radio = radio_td?.children[0] as HTMLInputElement
  if (!radio.checked) {
    return
  }
  const prev_row = parent.previousSibling as Element | null
  const prev_row_children = prev_row?.children
  if (prev_row_children) {
    return set_radio_from_row(prev_row_children)
  }
  // otherwise, try the next sibling
  const next_row = parent.nextSibling as Element | null
  const next_row_children = next_row?.children
  if (next_row_children) {
    set_radio_from_row(next_row_children)
  }
}

function set_radio_from_row(row: HTMLCollection) {
  const radio = row[0].children[0]
  if (radio) {
    (radio as HTMLInputElement).checked = true
  }
}

function update_color_picker(
  stage: PIXI.Container,
  party_num: number,
  evt: Event
) {
  const target = evt.target as HTMLInputElement
  if (!target.value) {
    return
  }
  const party = stage.children
    .filter(c => c instanceof InfoGraphics)
    .find(c => (c as InfoGraphics).num === party_num) as InfoGraphics | null

  if (!party) {
    return
  }

  const color = color_str_to_num(target.value)
  plot_single_party(stage, party.num, color, party.x, party.y)
  party.destroy()
}
