import * as d3 from "d3-color"
import { Legend } from "./types"

export function plot_color_wheel(legend: Legend): void {
  // the max chroma
  // each ring with radius r corresponds to a chroma value of r
  const max_radius = 70
  const radius_step = 1

  const canvas = document.createElement('canvas')
  // canvas dimensions are larger than the radius as we want to plot labels
  canvas.width = 200
  canvas.height = 200

  const ctx = canvas.getContext('2d')!
  const origin = canvas.width / 2

  const original_transform = ctx.getTransform()

  // TODO: technically this color wheel can be pre-calculated and its pixels hardcoded
  // because it will never change - rotation of parties won't change the color either
  // this is probably worth doing because there is no reason to take a performance hit
  // calculating the same thing over and over

  // https://stackoverflow.com/questions/37286039/creating-rainbow-gradient-createjs
  for (let radius = max_radius; radius > 0; radius -= radius_step) {
    const inner_radius = radius - radius_step
    const outer_radius = radius
    // remap 8-1 to 100-0
    // the range 8 to 1 has 7 possible values
    const gap = Math.floor(radius / 100 * 7) + 1

    for (let a = 360; a > 0; a--) {
      ctx.setTransform(1, 0, 0, 1, origin, origin)
      ctx.rotate(a / 180 * Math.PI)
      const color = d3.hcl(a, radius, 55)
      ctx.fillStyle = color.rgb().clamp().toString()
      ctx.fillRect(inner_radius, 0, outer_radius - inner_radius, gap)
    }
  }

  ctx.setTransform(original_transform)

  ctx.fillStyle = 'black'
  ctx.font = "10px sans-serif"
  legend.radviz!.party_coords.forEach((coord, idx) => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    ctx.arc(origin + x, origin + y, 5, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    draw_party_num(ctx, idx, origin, x, y)
  })

  ctx.strokeStyle = 'lightgray'
  legend.radviz!.seat_coords.forEach(coord => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    ctx.arc(origin + x, origin + y, 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.stroke()
  })

  const container = document.getElementById('color-wheel')!
  if (container.children.length > 0) {
    container.removeChild(container.lastChild!)
  }
  container.appendChild(canvas)
}

/**
 * This function contains code adapted from https://github.com/DistrictDataLabs/yellowbrick/blob/develop/yellowbrick/features/radviz.py
 */
function draw_party_num(
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
