import { PARTY_RADIUS } from "./constants"
import { grid_x_to_pct, grid_y_to_pct, pointer_pct_to_grid } from "./convert_locations"
import { Coalition } from "./types/cache"
import { Party } from "./types/election"
import { Dimension, GridCoords, PercentageCoords } from "./types/position"

export class PartyManager {
  parties: Array<Party> = []
  /** A flag to indicate if certain party settings has changed,
   * such as dragging a party or deleting them.
   * If it was changed, then the seat and coalition columns will no longer update
   * on hover, as the plot no longer reflects the new settings. */
  party_changed = false
  /** Coalitions that the parties are associated with */
  coalitions: Array<Coalition> = []

  add(grid_x: number, grid_y: number, color: string, num: number): Party {
    const party: Party = {
      grid_x,
      grid_y,
      x_pct: grid_x_to_pct(grid_x),
      y_pct: grid_y_to_pct(grid_y),
      color,
      num,
    }
    this.parties.push(party)
    return party
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

  /** convert a party number to a number that can index `this.parties`
    * They are not the same because a party can be deleted,
    * and their numbers will no longer correspond to their index */
  num_to_index(num: number): number | null {
    const idx = this.parties.findIndex(p => p.num === num)
    return idx >= 0 ? idx : null
  }

  // TODO: merge with above
  coalition_num_to_index(num: number): number | null {
    const idx = this.coalitions.findIndex(p => p.coalition_num === num)
    return idx >= 0 ? idx : null
  }

  delete(num: number): void {
    const idx = this.num_to_index(num)
    if (idx !== null) {
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

  find_hovered_party(
    pointer_x: number,
    pointer_y: number,
    canvas_dimensions: Dimension,
  ): Party | null {
    return this.parties
      .find(party => {
        const canvas_x = party.x_pct * canvas_dimensions.width
        const canvas_y = party.y_pct * canvas_dimensions.height
        const dist = Math.sqrt(
          (pointer_x - canvas_x) ** 2 + (pointer_y - canvas_y) ** 2
        )
        // needs a *2 here for some reason
        return dist <= (PARTY_RADIUS * 2)
      }) ?? null
  }

  set_coalition_of_party(party_num: number, coalition_num: number | null): void {
    const current_coalition =
      this.coalitions.find(coalition => coalition.parties.includes(party_num))
    if (current_coalition) {
      const idx = current_coalition.parties.indexOf(party_num)
      if (idx > -1) {
        current_coalition.parties.splice(idx, 1)
      }
    }

    const new_coalition =
      this.coalitions.find(coalition => coalition.coalition_num === coalition_num)
    if (new_coalition) {
      new_coalition.parties.push(party_num)
    }
  }
}
