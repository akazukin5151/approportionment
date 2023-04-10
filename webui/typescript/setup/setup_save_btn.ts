import { cache } from "../cache";
import { PARTY_CANVAS_SIZE } from "../constants";
import { AllCanvases } from "../types/canvas";

export function setup_save_button(all_canvases: AllCanvases): void {
  const btn = document.getElementById('save-btn')!;
  btn.addEventListener('click', () => {
    if (!cache) {
      return
    }

    // save current plot
    const ctx = all_canvases.party.ctx
    const image_data = ctx.getImageData(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)

    // plot the simulation (it has a higher resolution than the simulation
    // canvas; plotting parties on simulation would make the parties blurry)
    ctx.globalCompositeOperation = 'destination-over'
    ctx.drawImage(
      all_canvases.simulation.elem, 0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE
    )

    // download the image
    const a = document.createElement('a')
    a.download = 'plot.png'
    a.href = all_canvases.party.elem.toDataURL()
    a.click()
    a.remove()

    // restore old plot
    all_canvases.party.ctx.putImageData(image_data, 0, 0)
  })
}
