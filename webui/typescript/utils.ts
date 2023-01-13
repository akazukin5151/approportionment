export function grid_x_to_pct(grid_x: number): number {
  return (grid_x + 1) / 2
}

export function grid_y_to_pct(grid_y: number): number {
  return -1 * ((grid_y + 1) / 2 - 1)
}

export function parties_from_table(): Array<Element> {
  const table = document.getElementById('party-table')!
  const tbody = table.children[0]!
  return Array.from(tbody.children)
}

