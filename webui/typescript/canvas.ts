import { CanvasPlotter } from "./canvas_plotter"
import { PartyPlotInfo, Rgb } from "./types"

export class Canvas {
  private elem: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private image_data: ImageData
  private plt: CanvasPlotter
  image_data_len: number

  /** Setup the canvas and adds it to the given chart element **/
  constructor(z_index: number, rows: number, cols: number, chart: HTMLElement) {
    this.elem = document.createElement('canvas')
    this.elem.width = 200
    this.elem.height = 200
    this.elem.style.zIndex = z_index.toString()
    this.ctx = this.elem.getContext('2d')!
    this.image_data = this.ctx.createImageData(200, 200)
    this.image_data_len = this.image_data.data.length
    this.plt = new CanvasPlotter(rows, cols)
    chart.appendChild(this.elem)
  }

  clear_canvas(this: Canvas) {
    for (let i = 0; i < this.image_data.data.length; i += 4) {
      this.image_data.data[i + 4] = 0
    }
  }

  plot_between(
    this: Canvas,
    start: number,
    end: number,
    colors: Array<Rgb>,
    alphas: Array<number> = []
  ) {
    for (let i = start; i < end; i += 4) {
      const color = colors[i];
      this.image_data.data[i + 0] = color?.r ?? 255;
      this.image_data.data[i + 1] = color?.g ?? 255;
      this.image_data.data[i + 2] = color?.b ?? 255;
      this.image_data.data[i + 3] = alphas[i] ?? 255;
    }
  }

  plot_pixel(
    this: Canvas,
    row_index: number,
    col_index: number,
    color: Rgb,
    alpha: number = 255
  ): { error: string | null } {
    return this.plt.plot_pixel(this.image_data, row_index, col_index, color, alpha)
  }

  plot_square(this: Canvas, p: PartyPlotInfo, alpha: number = 255): void {
    return this.plt.plot_square(this.image_data, p, alpha)
  }

  putImageData(this: Canvas) {
    this.ctx.putImageData(this.image_data, 0, 0)
  }

  addEventListener(
    this: Canvas,
    type: keyof HTMLElementEventMap,
    listener: (this: HTMLCanvasElement, ev: Event) => any
  ) {
    this.elem.addEventListener(type, listener)
  }

}
