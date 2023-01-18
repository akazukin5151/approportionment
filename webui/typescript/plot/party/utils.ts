import { RADIUS } from "../../constants";
import { load_parties } from "../../form";
import { Party } from "../../types";
import { get_canvas_dimensions } from "../../form";

export function find_hovered_party(e: MouseEvent): Party | null {
  const pointer_x = e.offsetX
  const pointer_y = e.offsetY
  const parties = load_parties()
  const canvas_dimensions = get_canvas_dimensions()
  return parties
    .find(party => {
      const canvas_x = party.x_pct * canvas_dimensions.width
      const canvas_y = party.y_pct * canvas_dimensions.height
      const dist = Math.sqrt(
        (pointer_x - canvas_x) ** 2 + (pointer_y - canvas_y) ** 2
      )
      // needs a *2 here for some reason
      return dist <= (RADIUS * 2)
    }) ?? null
}
