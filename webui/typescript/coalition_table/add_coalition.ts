import { coalition_bar_chart, party_manager } from "../cache";
import { Canvas } from "../types/canvas";
import { colorize_by_handler } from "./coalition_table";
import { create_party_drop_td } from "./drag_and_drop";

export function add_coalition(
  tbody: HTMLTableSectionElement,
  num: number,
  simulation_canvas: Canvas,
  set_colorize_by: boolean
): void {
  const row = document.createElement('tr')
  row.appendChild(create_coalition_num_td(num, set_colorize_by, simulation_canvas))
  row.appendChild(create_party_drop_td(simulation_canvas))
  row.appendChild(create_delete_button_td())
  tbody.insertBefore(row, tbody.children[tbody.children.length - 1]!)
  // TODO: color for coalition
  coalition_bar_chart.add_bar(num, '#9d9d9d')
}

function create_coalition_num_td(
  num: number,
  set_colorize_by: boolean,
  simulation_canvas: Canvas
): HTMLTableCellElement{
  const td = document.createElement('td')
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(num.toString()))
  div.style.borderRadius = '20px'
  div.style.backgroundColor = '#e2e2e2'
  div.style.width = '30px'
  div.style.marginLeft = 'auto'
  div.style.marginRight = 'auto'
  if (set_colorize_by) {
    div.classList.add('colorize-by')
  }
  div.addEventListener('click', e => colorize_by_handler(e, simulation_canvas))
  td.appendChild(div)
  return td
}

function create_delete_button_td(): HTMLTableCellElement {
  const btn_td = document.createElement('td')
  const delete_btn = document.createElement('button')
  const span = document.createElement('span')
  span.className = 'icon icon-del'
  span.title = 'Delete coalition row'
  delete_btn.appendChild(span)
  delete_btn.onclick = delete_coalition
  delete_btn.className = 'tertiary-button delete-button'

  // needed to give it a size, for some reason
  delete_btn.style.paddingLeft = '0'
  delete_btn.style.paddingRight = '0'
  btn_td.style.paddingLeft = '0'
  btn_td.style.paddingRight = '0'
  btn_td.appendChild(delete_btn)
  return btn_td
}

function delete_coalition(ev: MouseEvent): void {
  const e = ev.target
  if (e instanceof Element) {
    const btn_td = e.parentNode!.parentNode as Element
    const tr = btn_td.parentNode as Element
    const num = (tr.children[0] as HTMLElement).innerText
    const cnum = parseInt(num)
    coalition_bar_chart.delete_bar(cnum)
    move_parties_to_none(tr, cnum)
    tr.remove()
  }
}

function move_parties_to_none(tr: Element, cnum: number): void {
  const tbody = tr.parentElement!
  const none_row = tbody.lastElementChild!
  const none_area = none_row.children[1]!.children[0]!

  const area = tr.children[1]!.children[0]!
  // collect into array first, otherwise moving the element would change the
  // children list
  Array.from(area.children).forEach(elem => {
    none_area.appendChild(document.getElementById(elem.id)!)
  })

  party_manager.coalitions.delete_coalition(cnum)
}

