import { Canvas, Rgb } from "./types";

export function setup_canvas(z_index: number, chart: HTMLElement): Canvas {
  const elem = document.createElement('canvas')
  elem.width = 200
  elem.height = 200
  elem.style.zIndex = z_index.toString()
  elem.className = 'overlaid-canvas canvas-size'
  elem.onmouseenter = (): string => document.body.style.cursor = 'crosshair'
  elem.onmouseleave = (): string => document.body.style.cursor = 'auto'
  chart.appendChild(elem)
  const ctx = elem.getContext('2d')!
  return { ctx, elem }
}

export function clear_canvas(canvas: Canvas): void {
  canvas.ctx.clearRect(0, 0, 200, 200)
}

// informal timings suggests that this is extremely fast already
// so there's no need to use wasm to fill in the image data array
export function plot_colors_to_canvas(
  canvas: Canvas,
  start: number,
  colors: Array<Rgb>,
  alphas: Array<number> = []
): void {
  const image_data = canvas.ctx.createImageData(200, 200)
  const end = image_data.data.length
  let color_i = 0;
  for (let i = start; i < end; i += 4) {
    const color = colors[color_i];
    image_data.data[i + 0] = color?.r ?? 255;
    image_data.data[i + 1] = color?.g ?? 255;
    image_data.data[i + 2] = color?.b ?? 255;
    image_data.data[i + 3] = alphas[color_i] ?? 255;
    color_i += 1
  }
  canvas.ctx.putImageData(image_data, 0, 0)
}

