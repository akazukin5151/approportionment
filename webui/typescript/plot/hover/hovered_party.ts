import { party_manager } from "../../cache";
import { PARTY_RADIUS } from "../../constants";
import { Party } from "../../types/election";
import { Dimension } from "../../types/position";

// TODO: move to PartyManager class
export function find_hovered_party(
  pointer_x: number,
  pointer_y: number,
  canvas_dimensions: Dimension,
): Party | null {
  return party_manager.parties
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
