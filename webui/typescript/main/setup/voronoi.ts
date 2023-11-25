import { AllCanvases } from "../types/canvas"
import { disable_voronoi, plot_voronoi } from "../voronoi"

export function setup_voronoi(all_canvases: AllCanvases): void {
  const { simulation, voronoi } = all_canvases
  const checkbox = document.getElementById('show_voronoi') as HTMLInputElement
  checkbox.addEventListener('click', () => {
    if (checkbox.checked) {
      if (simulation.elem.style.filter === '') {
        simulation.elem.style.filter = 'opacity(.2)'
      }
      voronoi.elem.style.display = 'initial'
      plot_voronoi(voronoi.ctx)
    } else {
      disable_voronoi(all_canvases)
    }
  })
}
