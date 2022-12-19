import * as PIXI from 'pixi.js'
import { DEFAULT_PARTIES } from './constants';
import { color_num_to_string, x_scale, y_scale } from './utils';
import { plot_party_core } from './pixi'

function random_between(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function round_1dp(n: number) {
  return Math.round(n * 10) / 10
}

function random_color(): number {
  return Math.round(random_between(0, 0xffffff))
}

function generic_new_row(
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
  const color_picker_td = document.createElement('td')
  color_picker_td.appendChild(color_picker)
  row.appendChild(color_picker_td)

  const x_td = document.createElement('td')
  x_td.appendChild(document.createTextNode(x.toString()))
  row.appendChild(x_td)

  const y_td = document.createElement('td')
  y_td.appendChild(document.createTextNode(y.toString()))
  row.appendChild(y_td)

  const delete_btn = document.createElement('button')
  delete_btn.innerText = 'Delete'
  delete_btn.onclick = evt => delete_party(stage, evt)
  row.appendChild(delete_btn)

  tbody.appendChild(row)
  return next_party_num
}

export function setup_party_table(stage: PIXI.Container) {
  const table = document.getElementById('party_table')
  if (!table) { return }
  const tbody = table.getElementsByTagName("tbody")[0];

  add_default_parties(stage, tbody);

  const btn = document.getElementById('add_party_button')
  btn?.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))

    const next_party_num = generic_new_row(stage, tbody, false, color, x, y)

    const parties = [{
      x: x_scale(x),
      y: y_scale(y),
      color,
      num: next_party_num
    }]
    plot_party_core(stage, parties)
  })
}

function add_default_parties(stage: PIXI.Container, tbody: HTMLTableSectionElement) {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(stage, tbody, idx === 2, party.color, party.x, party.y)
  })
}

function delete_party(stage: PIXI.Container, ev: MouseEvent) {
  const e = ev.target
  if (e) {
    const parent = (e as Element).parentNode as Element
    const num_td = parent.children[1] as HTMLElement
    const party_num = num_td.innerText
    const elems = stage.children;
    Array.from(elems).forEach(e => {
      // @ts-ignore
      const n: number = e.num
      if (n === parseInt(party_num)) {
        e.visible = false
      }
    })
    reselect_radio(parent)
    parent.remove()
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
