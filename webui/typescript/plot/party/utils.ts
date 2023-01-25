import { AllCanvases } from "../../types/app"

export function hide_voter_canvas(
  { simulation, voter }: Pick<AllCanvases, 'simulation' | 'voter'>
): void {
  simulation.elem.style.filter = ''
  voter.elem.style.display = 'none'
}
