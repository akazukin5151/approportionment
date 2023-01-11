import { PartyPlotBoundary } from "../../boundary";
import { Party, PartyPlotInfo, PercentageCoord, Rgb } from "../../types";

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

export function norm_pointer_to_grid(
  target: HTMLElement,
  e: MouseEvent
): PercentageCoord {
  const max_y = target.clientHeight
  const max_x = target.clientWidth
  const norm_x = e.offsetX / max_x
  const norm_y = e.offsetY / max_y
  return { x: norm_x, y: norm_y }
}

export function scale_pointer_to_grid(norm: PercentageCoord): PercentageCoord {
  const scaled_x = norm.x * 2 - 1
  const scaled_y = -1 * ((norm.y) * 2 - 1)
  return { x: scaled_x, y: scaled_y }
}

