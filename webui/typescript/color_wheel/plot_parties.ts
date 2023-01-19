import { AppCache } from "../types"

export function plot_parties_on_circumference(
  ctx: CanvasRenderingContext2D,
  cache: AppCache,
  max_radius: number,
  origin: number,
): void {
  ctx.font = "10px sans-serif"
  ctx.strokeStyle = 'black'
  cache.legend.radviz!.party_coords.forEach((coord, idx) => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y
    const party = cache.parties[idx]!
    ctx.fillStyle = party.color
    ctx.beginPath()
    // subtract y because, a large y means higher up, so a lower y coordinate
    ctx.arc(origin + x, origin - y, 5, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    draw_party_num_with_offsets(ctx, idx, origin, x, y)
  })
}

/**
 * This function contains code adapted from https://github.com/DistrictDataLabs/yellowbrick/blob/develop/yellowbrick/features/radviz.py
 */
function draw_party_num_with_offsets(
  ctx: CanvasRenderingContext2D,
  idx: number,
  origin: number,
  x: number,
  y: number
): void {
  // using party colors as text color would be cute but sometimes
  // it would be unreadable
  ctx.fillStyle = 'black'
  let offset_x = origin + x
  let offset_y = origin - y
  const offset = 10
  if (x < 0 && y < 0) {
    offset_x -= offset
    offset_y += offset
  } else if (x < 0 && y >= 0) {
    offset_x -= offset
    offset_y -= offset
  } else if (x >= 0 && y < 0) {
    offset_x += offset
    offset_y += offset
  } else if (x >= 0 && y >= 0) {
    offset_x += offset
    offset_y -= offset
  }
  ctx.fillText(idx.toString(), offset_x, offset_y)
}
