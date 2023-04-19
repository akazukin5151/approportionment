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
  delete_btn.className = 'tertiary-button delete-button'
  btn_td.appendChild(delete_btn)
  return btn_td
}

export function clear_legend_highlight(): void {
  const legend_table = document.getElementById('legend-table') as HTMLElement
  const tbody = legend_table.children[1]!
  const trs = tbody.children
  for (const tr of trs) {
    const row = tr as HTMLElement
    row.style.backgroundColor = 'initial'
  }
}
