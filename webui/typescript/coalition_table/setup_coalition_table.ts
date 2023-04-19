import { coalition_bar_chart, party_manager } from "../cache";
import { replot } from "../plot/replot";
import { array_max } from "../std_lib";
import { Canvas } from "../types/canvas";
import { colorize_by_handler } from "./coalition_table";

export function setup_coalition_table(simulation_canvas: Canvas): void {
  const add_btn = document.getElementById('add-coalition-btn')! as HTMLElement;
  const table = document.getElementById('coalition-table')!;
  const tbody = table.getElementsByTagName("tbody")[0]!;
  add_btn.onclick = (): void => {
    const num = find_next_coalition_num(tbody)
    add_coalition(tbody, num, simulation_canvas, false)
  }
  const td = tbody.lastElementChild!.children[1]!
  const container = td.children[0] as HTMLDivElement
  add_drop_listeners(container, simulation_canvas)
}

export function add_coalition(
  tbody: HTMLTableSectionElement,
  num: number,
  simulation_canvas: Canvas,
  set_colorize_by: boolean
): void {
  const row = document.createElement('tr')

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
  row.appendChild(td)

  row.appendChild(create_party_drop_td(simulation_canvas))
  row.appendChild(create_delete_button_td())
  tbody.insertBefore(row, tbody.children[tbody.children.length - 1]!)

  // TODO: color for coalition
  coalition_bar_chart.add_bar(num, '#c6c6c6')
}

function create_delete_button_td(
): HTMLTableCellElement {
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


function create_party_drop_td(simulation_canvas: Canvas): HTMLTableCellElement {
  const td = document.createElement('td')
  const div = document.createElement('div')
  div.className = 'party-dot-area'
  add_drop_listeners(div, simulation_canvas)
  td.appendChild(div)
  return td
}

function add_drop_listeners(div: HTMLDivElement, simulation_canvas: Canvas): void {
  div.addEventListener(
    'drop',
    ev => {
      ev.preventDefault()
      ev.dataTransfer!.dropEffect = "move"
      const elem_id = ev.dataTransfer!.getData("text/plain")
      const party_num = parseInt(elem_id.slice('party-dot-'.length))

      const party_dot_area = ev.target as HTMLElement
      const col_2 = party_dot_area.parentElement
      const col_1 = col_2?.previousElementSibling as HTMLElement
      // the 'None' cell doesn't have a div around it
      // coalition numbers have a div around them, but innerText works anyway
      const n = col_1.innerText
      const coalition_num = n === 'None' ? null : parseInt(n)
      party_manager.set_coalition_of_party(party_num, coalition_num)
      replot(simulation_canvas)
    }
  )
  div.addEventListener(
    'dragover',
    ev => {
      ev.preventDefault()
      const elem = ev.target as HTMLElement
      // prevent dropping into another party dot, overlapping them
      if (elem.draggable) {
        return
      }
      const data = ev.dataTransfer!.getData("text/plain")
      elem.appendChild(document.getElementById(data)!)

      const party_num = parseInt(data.slice('party-dot-'.length))
      const row = elem.parentElement!.parentElement!
      const cnum_td = row.children[0] as HTMLElement
      const n = cnum_td.innerText
      const coalition_num = n === 'None' ? null : parseInt(n)
      party_manager.set_coalition_of_party(party_num, coalition_num)

      // TODO replot if we are colorizing by coalition and that coalition has changed
    }
  )
}

function find_next_coalition_num(tbody: Element): number {
  const nums = Array.from(tbody.children)
    .map(row => {
      const num = row.children[0] as HTMLElement
      return parseInt(num.innerText)
    })
  return array_max(nums) + 1
}

function delete_coalition(ev: MouseEvent): void {
  const e = ev.target
  if (e instanceof Element) {
    const btn_td = e.parentNode!.parentNode as Element
    const tr = btn_td.parentNode as Element
    const num = (tr.children[0] as HTMLElement).innerText
    coalition_bar_chart.delete_bar(parseInt(num))
    tr.remove()
  }
}

