import { Canvas } from "../types"

export function setup_canvas(z_index: number): Canvas {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  canvas.style.zIndex = z_index.toString()
  const chart = document.getElementById('chart')
  chart!.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const image_data = ctx.createImageData(200, 200)
  return { elem: canvas, ctx, image_data }
}
