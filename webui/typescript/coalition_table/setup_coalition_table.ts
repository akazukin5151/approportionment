import { add_to_colorize_by, remove_from_colorize_by } from "../form";
import { array_max } from "../std_lib";
import { create_delete_button_td_with_cb, create_text_td } from "../td"

export function setup_coalition_table(): void {
  const add_btn = document.getElementById('add-coalition-btn')! as HTMLElement;
  add_btn.onclick = (): void => {
    const table = document.getElementById('coalition-table')!;
    const tbody = table.getElementsByTagName("tbody")[0]!;
    const num = find_next_coalition_num(tbody)

    const row = document.createElement('tr')
    row.appendChild(create_text_td(num))
    row.appendChild(create_text_td(0))
    row.appendChild(create_delete_button_td_with_cb(delete_coalition))
    tbody.appendChild(row)

    add_coalition_to_dropdown(num)
    add_to_colorize_by('Coalition', num)
  }
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
    remove_coalition_from_party_table(num)
    remove_from_colorize_by('Coalition', num)
    tr.remove()
  }
}

function remove_coalition_from_party_table(num: string): void {
  const selects = document.getElementsByClassName('select-coalition')!;
  for (const select of selects) {
    const options = (select as HTMLSelectElement).options
    Array.from(options)
      .filter(option => option.text === num)
      .map(option => option.remove())
  }
}

