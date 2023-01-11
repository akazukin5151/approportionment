import { Canvas } from "../types"

export function setup_canvas(): Canvas {
  const chart = document.getElementById('chart')
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  chart!.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const image_data = ctx.createImageData(200, 200)
  return { elem: canvas, ctx, image_data }
}
