import { CANVAS_SIDE, PARTY_CANVAS_SIZE } from "./constants";
import { Canvas, AllCanvases } from "./types/canvas";
import { Rgb } from "./types/core";

export function setup_all_canvases(chart: HTMLElement): AllCanvases {
  const party = setup_canvas(3, true, chart, PARTY_CANVAS_SIZE)
  const voronoi = setup_canvas(2, true, chart, CANVAS_SIDE)
  const voter = setup_canvas(1, false, chart, CANVAS_SIDE)
  voter.elem.style.display = 'none'
  const simulation = setup_canvas(0, false, chart, CANVAS_SIDE)
  return { party, voronoi, voter, simulation }
}

function setup_canvas(
  z_index: number,
  drop_shadow: boolean,
  chart: HTMLElement,
  size: number
): Canvas {
  const elem = document.createElement('canvas')
  elem.width = size
  elem.height = size
  elem.style.zIndex = z_index.toString()
  let name = 'overlaid-canvas canvas-size'
  if (drop_shadow) {
    name += ' drop-shadow'
  }
  elem.className = name
  // this is needed because hovering on parties will change the cursor
  // so a naive `elem.style.cursor` won't work
  elem.onmouseenter = (): string => document.body.style.cursor = 'crosshair'
  elem.onmouseleave = (): string => document.body.style.cursor = 'auto'
  chart.appendChild(elem)
  const ctx = elem.getContext('2d')!
  return { ctx, elem }
}

export function clear_canvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, CANVAS_SIDE, CANVAS_SIDE)
}

// informal timings suggests that this is extremely fast already
// so there's no need to use wasm to fill in the image data array
export function plot_colors_to_canvas(
  canvas: Canvas,
  colors: Array<Rgb>,
  alphas: Array<number> = []
): void {
  const image_data = canvas.ctx.createImageData(CANVAS_SIDE, CANVAS_SIDE)
  const end = image_data.data.length
  let color_i = 0;
  for (let i = 0; i < end; i += 4) {
    const color = colors[color_i];
    image_data.data[i + 0] = color?.r ?? 255;
    image_data.data[i + 1] = color?.g ?? 255;
    image_data.data[i + 2] = color?.b ?? 255;
    image_data.data[i + 3] = alphas[color_i] ?? 255;
    color_i += 1
  }
  canvas.ctx.putImageData(image_data, 0, 0)
}

