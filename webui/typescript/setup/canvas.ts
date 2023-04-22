import { CANVAS_SIDE, PARTY_CANVAS_SIZE } from "../constants";
import { Canvas, AllCanvases } from "../types/canvas";

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

