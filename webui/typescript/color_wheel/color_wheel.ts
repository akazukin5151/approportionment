import * as d3 from "d3-color"
import { clear_canvas } from "../canvas"
import { map_party_to_circumference } from "../colormap_nd/colormap_nd"
import { AppCache, Legend } from "../types"
import { on_drag_start } from "./drag"
import { plot_parties_on_circumference } from "./plot_parties"

export function plot_color_wheel_legend(cache: AppCache): void {
  // the max chroma
  // each ring with radius r corresponds to a chroma value of r
  const max_radius = 70
  const radius_step = 1

  const container = document.getElementById('color-wheel-container')!
  container.style.display = 'initial'
  const canvas = document.getElementById('color-wheel') as HTMLCanvasElement
  canvas.style.display = 'initial'
  const ctx = canvas.getContext('2d')!
  const origin = canvas.width / 2

  ctx.clearRect(0, 0, 200, 200)
  plot_color_wheel(ctx, max_radius, origin, radius_step)
  plot_mapped_seats(ctx, cache.legend, max_radius, origin)

  const party_canvas =
    document.getElementById('color-wheel-party') as HTMLCanvasElement
  party_canvas.style.display = 'initial'
  const party_ctx = party_canvas.getContext('2d')!
  clear_canvas(party_ctx)
  plot_parties_on_circumference(party_ctx, cache, max_radius, origin)

  party_canvas.addEventListener(
    'mousedown',
    e => on_drag_start(
      party_ctx, e, cache.legend.radviz!.party_coords,
      (ctx, angle) => {
      const coords = cache.legend.radviz!.party_coords
      cache.legend.radviz!.party_coords =
        coords.map((_, i) => map_party_to_circumference(i, coords.length, angle))
      plot_parties_on_circumference(party_ctx, cache, max_radius, origin)
    })
  )
}

function plot_color_wheel(
  ctx: CanvasRenderingContext2D,
  max_radius: number,
  origin: number,
  radius_step: number,
): void {
  // TODO: technically this color wheel can be pre-calculated and its pixels
  // hardcoded, because it will never change - rotation of parties
  // won't change the color either
  // this is probably worth doing because there is no reason to take
  // a non-negligible performance hit calculating the same thing over and over

  const original_transform = ctx.getTransform()

  // https://stackoverflow.com/questions/37286039/creating-rainbow-gradient-createjs
  for (let radius = max_radius; radius > 0; radius -= radius_step) {
    const inner_radius = radius - radius_step
    const outer_radius = radius
    // remap 8-1 to 100-0
    // the range 8 to 1 has 7 possible values
    const gap = Math.floor(radius / 100 * 7) + 1

    for (let a = 360; a > 0; a--) {
      ctx.setTransform(1, 0, 0, 1, origin, origin)
      ctx.rotate(-a / 180 * Math.PI)
      const color = d3.hcl(a, radius, 55)
      ctx.fillStyle = color.rgb().clamp().toString()
      ctx.fillRect(inner_radius, 0, outer_radius - inner_radius, gap)
    }
  }

  ctx.setTransform(original_transform)
}

function plot_mapped_seats(
  ctx: CanvasRenderingContext2D,
  legend: Legend,
  max_radius: number,
  origin: number,
): void {
  ctx.strokeStyle = 'lightgray'
  legend.radviz!.seat_coords.forEach(coord => {
    const x = max_radius * coord.grid_x
    const y = max_radius * coord.grid_y

    ctx.beginPath()
    // subtract y because, a large y means higher up, so a lower y coordinate
    ctx.arc(origin + x, origin - y, 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.stroke()
  })
}

