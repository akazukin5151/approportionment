type ToString = { toString: () => string }

export function create_text_td<T extends ToString>(n: T): HTMLTableCellElement {
  const td = document.createElement('td')
  td.appendChild(document.createTextNode(n.toString()))
  return td
}

export function create_delete_button_td_with_cb(
  onclick: (evt: MouseEvent) => void
): HTMLTableCellElement {
  const btn_td = document.createElement('td')
  const delete_btn = document.createElement('button')
  delete_btn.innerText = 'Delete'
  delete_btn.onclick = onclick
  btn_td.appendChild(delete_btn)
  return btn_td
}

export function clear_party_seats_td(row: Element): void {
  const seat_td = row.children[5] as HTMLElement
  const p = seat_td.getElementsByTagName('p')[0] as HTMLElement
  p.innerText = ''
}
