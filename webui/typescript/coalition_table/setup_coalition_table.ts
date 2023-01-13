import { array_max } from "../std_lib";
import { create_button_td, create_text_td } from "../td"

export function setup_coalition_table() {
  const add_btn = document.getElementById('add-coalition-btn')! as HTMLElement;
  add_btn.onclick = () => {
    const table = document.getElementById('coalition-table')!;
    const tbody = table.children[0]!;
    const num = find_next_coalition_num(tbody)

    const row = document.createElement('tr')
    row.appendChild(create_text_td(num))
    row.appendChild(create_text_td(0))
    row.appendChild(create_button_td(delete_coalition))
    tbody.appendChild(row)

    add_coalition_to_dropdown(num)
  }
}

function find_next_coalition_num(tbody: Element): number {
  const nums = Array.from(tbody.children)
    .slice(1)
    .map(row => parseInt(row.children[0]!.innerHTML))
  return array_max(nums) + 1
}

function add_coalition_to_dropdown(num: number) {
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
    const selects = document.getElementsByClassName('select-coalition')!;
    for (const select of selects) {
      const options = (select as HTMLSelectElement).options
      Array.from(options)
        .filter(option => option.text === num)
        .map(option => option.remove())
    }
    tr.remove()
  }
}

