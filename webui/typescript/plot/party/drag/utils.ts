import { PercentageCoords, pointer_pct_to_grid } from "../utils"

export function update_party_table(pct: PercentageCoords, drag_target_num: number) {
  const table = document.getElementById('party-table')
  const tbody = table?.children[0]
  if (!tbody) { return }
  Array.from(tbody.children).forEach(tr => {
    const num_str = tr.children[1] as HTMLInputElement
    if (parseInt(num_str.innerText) === drag_target_num) {
      const { grid_x, grid_y } = pointer_pct_to_grid(pct)
      tr.children[3]!.innerHTML = grid_x.toFixed(2)
      tr.children[4]!.innerHTML = grid_y.toFixed(2)
    }
  })
}

