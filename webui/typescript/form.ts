/** Functions that involve querying and modifying the form values through the DOM **/
import { Party } from "./types/election";
import { Dimension } from './types/position'
import { grid_x_to_pct, grid_y_to_pct } from "./convert_locations";

export function load_parties(): Array<Party> {
  return parties_from_table().map(load_party)
    .sort((a, b) => a.num - b.num)
}

export function load_party(tr: Element): Party {
  const grid_x = parseFloat((tr.children[2] as HTMLElement).innerText)
  const grid_y = parseFloat((tr.children[3] as HTMLElement).innerText)
  const color_td = (tr.children[1] as HTMLElement)
  const color_input = color_td.children[0] as HTMLInputElement
  return {
    x_pct: grid_x_to_pct(grid_x),
    y_pct: grid_y_to_pct(grid_y),
    grid_x,
    grid_y,
    color: color_input.value,
    num: parseInt((tr.children[0] as HTMLElement).innerText)
  }
}

export function get_colorize_by(): string {
  const party_group = document.getElementById('party-group')!
  const selected = Array.from(party_group.children)
    .map((elem, idx) => ({ elem: elem as HTMLOptionElement, idx }))
    .find(({ elem }) => elem.selected);
  if (selected) {
    return selected.elem.value
  }
  const coalition_group = document.getElementById('coalition-group')!
  const selected_ = Array.from(coalition_group.children)
    .map((elem, idx) => ({ elem: elem as HTMLOptionElement, idx }))
    .find(({ elem }) => elem.selected);
  return selected_!.elem.value
}

export function table_trs(table_id: string): Array<Element> {
  const table = document.getElementById(table_id)!
  const tbody = table.getElementsByTagName("tbody")[0]!;
  return Array.from(tbody.children)
}

export function parties_from_table(): Array<Element> {
  return table_trs('party-table')
}

export function coalitions_from_table(): Array<Element> {
  return table_trs('coalition-table')
}

export function clear_coalition_seats(): void {
  coalitions_from_table().forEach(row => {
    const seat_td = row.children[1] as HTMLElement
    seat_td.innerText = ''
  })
}

/** Get the current canvas layout size, which depends on the current screen width
 *
 * The canvas "data" size is always 200x200, which exactly matches the number of
 * elections simulated. The docs says:
 *
 * > The [canvas] element can be sized arbitrarily by CSS, but during rendering
 * > the image is scaled to fit its layout size: if the CSS sizing doesn't
 * > respect the ratio of the initial canvas, it will appear distorted.
 *
 * So the "data" size of 200x200 is scaled by the browser the fit the CSS sizing,
 * which depends on the current screen width. Thus there is no problem in plotting
 * the data or setting its width and height attributes.
 *
 * However, dragging needs the actual canvas layout size, to calculate where
 * the pointer is on the grid, so this function has to be used
 * */
export function get_canvas_dimensions(): Dimension {
  const canvas = document.getElementsByTagName('canvas')[0]!
  return { width: canvas.clientWidth, height: canvas.clientHeight }
}

export function should_expand_points(): boolean {
  const checkbox = document.getElementById('expand-points') as HTMLInputElement
  return checkbox.checked
}

export function get_cmap_name(): string {
  const btn = document.getElementById('cmap_select_btn')!
  return btn.innerText
}

export function add_to_colorize_by(name: string, num: number): void {
  const group = document.getElementById(`${name.toLowerCase()}-group`)!
  const option = document.createElement('option')
  option.value = `${name} ${num}`
  option.innerText = `${name} ${num}`
  group.appendChild(option)
}

export function remove_from_colorize_by(name: string, num: string): void {
  const group = document.getElementById(`${name.toLowerCase()}-group`)!
  const options = group.children as HTMLCollectionOf<HTMLOptionElement>
  Array.from(options)
    .filter(option => option.innerText === `${name} ${num}`)
    .map(option => option.remove())
}
