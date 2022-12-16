import * as d3 from 'd3';
import { DEFAULT_PARTIES, x_scale, y_scale } from './constants';
import { Setup } from './types';
import { plot_party_core } from './utils';

function random_between(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function round_1dp(n: number) {
  return Math.round(n * 10) / 10
}

function random_color() {
  const r = random_between(0, 255)
  const g = random_between(0, 255)
  const b = random_between(0, 255)
  return d3.rgb(r, g, b)
}

function generic_new_row(
  tbody: HTMLTableSectionElement,
  set_radio_checked: boolean,
  color: string,
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
  color_picker.value = color
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
  delete_btn.onclick = delete_party
  row.appendChild(delete_btn)

  tbody.appendChild(row)
  return next_party_num
}

export function setup_party_buttons(setup: Setup) {
  const table = document.getElementById('party_table')
  if (!table) { return }
  const tbody = table.getElementsByTagName("tbody")[0];

  add_default_parties(tbody);

  const btn = document.getElementById('add_party_button')
  btn?.addEventListener("click", () => {
    const color = random_color().formatHex()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))

    const next_party_num = generic_new_row(tbody, false, color, x, y)

    const parties = [{
      x: x_scale(x),
      y: y_scale(y),
      color,
      num: next_party_num
    }]
    plot_party_core(setup, parties)
  })
}

function add_default_parties(tbody: HTMLTableSectionElement) {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(tbody, idx === 2, party.color, party.x, party.y)
  })
}

function delete_party(ev: MouseEvent) {
  const e = ev.target
  if (e) {
    const parent = (e as Element).parentNode as Element
    const color_picker = parent.children[2].children[0] as HTMLInputElement
    const color = color_picker.value
    const elems = document.getElementsByClassName('party-circle');
    Array.from(elems).forEach(e => {
      if (e.getAttribute('fill')?.toLowerCase() === color.toLowerCase()) {
        e.remove()
      }
    })
    parent.remove()
  }
}
