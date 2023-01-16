import * as d3 from "d3-color"
import { Legend } from "./types"

// https://stackoverflow.com/questions/41844110/ploting-rgb-or-hex-values-on-a-color-wheel-using-js-canvas
export function plot_color_wheel(legend: Legend): void {
  // the max chroma
  // each ring with radius r corresponds to a chroma value of r
  const max_radius = 70
  const radius_step = 5

  const canvas = document.createElement('canvas')
  // canvas dimensions are larger than the radius as we want to plot labels
  canvas.width = 200
  canvas.height = 200

  const ctx = canvas.getContext('2d')!
  const origin = canvas.width / 2

  for (let radius = max_radius; radius > 0; radius -= radius_step) {
    const step = 1 / radius;
    for (let i = 0; i < 360; i += step) {
      const rad = i * (2 * Math.PI) / 360
      const color = d3.hcl(i, radius, 55)
      ctx.strokeStyle = color.rgb().clamp().toString()

      // x and y components of this angle
      const x = radius * Math.cos(rad)
      const y = radius * Math.sin(rad)

      ctx.beginPath()
      // move to the origin
      ctx.moveTo(origin, origin)
      // draw a line from origin to circumference of circle
      ctx.lineTo(origin + x, origin + y)
      ctx.closePath()
      ctx.stroke()
    }
  }

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
