import { PartyPlotBoundary } from "../../boundary";
import { Party, PartyPlotInfo, Rgb } from "../../types";

function color_to_rgb(color: string): Rgb {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5), 16)
  return { r, g, b }
}

export function party_to_ppi(p: Party): PartyPlotInfo {
  return {
    boundaries: new PartyPlotBoundary(p.x_pct, p.y_pct),
    color: color_to_rgb(p.color),
    num: p.num,
  }
}
