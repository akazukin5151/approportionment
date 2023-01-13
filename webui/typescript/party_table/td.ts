import { get_all_coalition_tr } from '../coalition_table/coalition_table';
import { delete_party, update_color_picker } from './utils';
import { create_button_td } from '../td'
import { Canvas } from '../types';
import { get_cache, parties_equals, set_cache } from '../setup/setup_worker';
import { parse_result } from '../plot/plot_simulation';
import { clear_canvas, plot_colors_to_canvas } from '../canvas';
import { load_parties } from '../load_parties';

export function create_radio_td(
  simulation_canvas: Canvas,
  set_radio_checked: boolean
): HTMLTableCellElement {
  const radio_input = document.createElement('input')
  radio_input.setAttribute('type', "radio")
  radio_input.setAttribute('class', 'party_radio')
  radio_input.setAttribute('name', 'party_radio')
  if (set_radio_checked) {
    radio_input.checked = true
  }
  radio_input.onchange = () => replot_on_radio_change(simulation_canvas)
  const radio_td = document.createElement('td')
  radio_td.appendChild(radio_input)
  radio_td.title = 'Plot how many seats this party wins'
  radio_td.className = 'help-cursor'
  return radio_td
}

function replot_on_radio_change(simulation_canvas: Canvas) {
  const cache = get_cache()
  const parties = load_parties()
  if (cache && parties_equals(cache.parties, parties)) {
    const new_cache = cache.cache.map(point => parse_result(point))
    set_cache({ cache: new_cache, parties })
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, new_cache.map(p => p.color))
  }
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
  color: string,
  canvas: Canvas,
  next_party_num: number
) {
  const color_picker = document.createElement('input')
  color_picker.setAttribute('type', "color")
  color_picker.value = color
  color_picker.addEventListener(
    'change',
    (evt) => update_color_picker(canvas, next_party_num, evt)
  )
  const color_picker_td = document.createElement('td')
  color_picker_td.appendChild(color_picker)
  return color_picker_td
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
  coalition_td.title = "Click 'Add coalition' to assign coalitions"
  coalition_td.className = 'help-cursor'
  return coalition_td
}

export function create_delete_button_td(canvas: Canvas): HTMLTableCellElement {
  return create_button_td(evt => delete_party(canvas, evt))
}
