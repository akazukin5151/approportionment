import { grid_x_to_pct, grid_y_to_pct, pointer_pct_to_grid } from "./convert_locations"
import { Party } from "./types/election"
import { GridCoords, PercentageCoords } from "./types/position"

export class PartyManager {
  parties: Array<Party>

  constructor() {
    this.parties = []
  }

  add(grid_x: number, grid_y: number, color: string, num: number): void {
    const party: Party = {
      grid_x,
      grid_y,
      x_pct: grid_x_to_pct(grid_x),
      y_pct: grid_y_to_pct(grid_y),
      color,
      num,
    }
    this.parties.push(party)
  }

  update_pct(
    num: number,
    pct: PercentageCoords,
  ): void {
    for (const party of this.parties) {
      if (party.num === num) {
        party.x_pct = pct.x_pct
        party.y_pct = pct.y_pct
        const { grid_x, grid_y } = pointer_pct_to_grid(pct)
        party.grid_x = grid_x
        party.grid_y = grid_y
        break
      }
    }
  }

  update_grid(
    num: number,
    grid: GridCoords
  ): void {
    for (const party of this.parties) {
      if (party.num === num) {
        party.grid_x = grid.grid_x
        party.grid_y = grid.grid_y
        party.x_pct = grid_x_to_pct(grid.grid_x)
        party.y_pct = grid_y_to_pct(grid.grid_y)
        break
      }
    }
  }

  update_color(num: number, color: string): void {
    for (const party of this.parties) {
      if (party.num === num) {
        party.color = color
        break
      }
    }
  }

  delete(num: number): void {
    const idx = this.parties.findIndex(p => p.num === num)
    if (idx >= 0) {
      this.parties.splice(idx, 1)
    }
  }

  next_party_num(): number {
    const party_numbers = this.parties.map(p => p.num)
    // Ensure there is at least one item in the array
    // The only item will be a 0 in that case
    party_numbers.push(-1)
    const max_party_num = Math.max(...party_numbers)
    return max_party_num + 1
  }
}
