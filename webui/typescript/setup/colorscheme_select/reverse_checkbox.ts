import { reverse_cmap, set_reverse_cmap } from "../../cache"
import { remove_all_children } from "../../dom"
import { Canvas } from "../../types/canvas"
import { add_all_groups } from "./dom"

export function setup_reverse_checkbox(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  container: HTMLElement
): void {
  const checkbox = document.getElementById('reverse-cmap')!
  checkbox.onclick = (): void => {
    set_reverse_cmap(!reverse_cmap)
    remove_all_children(container)
    add_all_groups(simulation_canvas, btn, reverse_cmap, container)
  }
}


