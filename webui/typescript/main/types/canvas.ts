export type Canvas = {
  ctx: CanvasRenderingContext2D,
  elem: HTMLCanvasElement
}

export type AllCanvases = {
  party: Canvas,
  simulation: Canvas,
  voter: Canvas,
  voronoi: Canvas
}

