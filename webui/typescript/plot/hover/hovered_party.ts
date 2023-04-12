import { PARTY_RADIUS } from "../../constants";
import { PartyManager } from "../../party";
import { Party } from "../../types/election";
import { Dimension } from "../../types/position";

export function find_hovered_party(
  pm: PartyManager,
  pointer_x: number,
  pointer_y: number,
  canvas_dimensions: Dimension,
): Party | null {
  return pm.parties
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
