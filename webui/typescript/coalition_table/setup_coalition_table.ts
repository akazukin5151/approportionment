import {
  add_to_colorize_by,
  remove_from_colorize_by
} from "../form";
import { array_max } from "../std_lib";
import { create_delete_button_td_with_cb, create_text_td } from "../td"
import { colorize_by_handler } from "./coalition_table";

export function setup_coalition_table(): void {
  const add_btn = document.getElementById('add-coalition-btn')! as HTMLElement;
  const table = document.getElementById('coalition-table')!;
  const tbody = table.getElementsByTagName("tbody")[0]!;
  add_btn.onclick = (): void => {
    const num = find_next_coalition_num(tbody)
    add_coalition(tbody, num)
  }
  const td = tbody.lastElementChild!.children[1]!
  const container = td.children[0] as HTMLDivElement
  add_drop_listeners(container)
}

export function add_coalition(tbody: HTMLTableSectionElement, num: number): void {
  const row = document.createElement('tr')

  const td = document.createElement('td')
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(num.toString()))
  div.style.borderRadius = '20px'
  div.style.backgroundColor = '#e2e2e2'
  div.style.width = '30px'
  div.style.marginLeft = 'auto'
  div.style.marginRight = 'auto'
  div.addEventListener('click', colorize_by_handler)
  td.appendChild(div)
  row.appendChild(td)

  row.appendChild(create_party_drop_td())
  row.appendChild(create_delete_button_td_with_cb(delete_coalition))
  tbody.insertBefore(row, tbody.children[tbody.children.length - 1]!)

  add_coalition_to_dropdown(num)
  add_to_colorize_by('Coalition', num)
}

function create_party_drop_td(): HTMLTableCellElement {
  const td = document.createElement('td')
  const div = document.createElement('div')
  div.className = 'party-dot-area'
  add_drop_listeners(div)
  td.appendChild(div)
  return td
}

function add_drop_listeners(div: HTMLDivElement): void {
  div.addEventListener(
    'drop',
    ev => {
      ev.preventDefault()
      ev.dataTransfer!.dropEffect = "move"
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
    }
  )
}

function find_next_coalition_num(tbody: Element): number {
  const nums = Array.from(tbody.children)
    .map(row => parseInt(row.children[0]!.innerHTML))
  return array_max(nums) + 1
}

function add_coalition_to_dropdown(num: number): void {
  const selects = document.getElementsByClassName('select-coalition')!;
  for (const select of selects) {
    const option = document.createElement('option')
    option.value = num.toString()
    option.text = num.toString()
    select.appendChild(option)
  }
}

function delete_coalition(ev: MouseEvent): void {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num = (tr.children[0] as HTMLElement).innerText
    remove_coalition_from_selects(num)
    remove_from_colorize_by('Coalition', num)
    tr.remove()
  }
}

function remove_coalition_from_selects(num: string): void {
  const selects = document.getElementsByClassName('select-coalition')!;
  for (const select of selects) {
    const options = (select as HTMLSelectElement).options
    Array.from(options)
      .filter(option => option.text === num)
      .map(option => option.remove())
  }
}

