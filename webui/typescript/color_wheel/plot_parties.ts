import { Legend } from "../types"

export function plot_parties_on_circumference(
  ctx: CanvasRenderingContext2D,
  legend: Legend,
  max_radius: number,
  origin: number,
): void {
  ctx.fillStyle = 'black'
  ctx.font = "10px sans-serif"
  legend.radviz!.party_coords.forEach((coord, idx) => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    ctx.arc(origin + x, origin + y, 5, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
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
  let offset_x = origin + x
  let offset_y = origin + y
  const offset = 10
  if (x < 0 && y < 0) {
    offset_x -= offset
    offset_y -= offset
  } else if (x < 0 && y >= 0) {
    offset_x -= offset
    offset_y += offset
  } else if (x >= 0 && y < 0) {
    offset_x += offset
    offset_y -= offset
  } else if (x >= 0 && y >= 0) {
    offset_x += offset
    offset_y += offset
  }
  ctx.fillText(idx.toString(), offset_x, offset_y)
}