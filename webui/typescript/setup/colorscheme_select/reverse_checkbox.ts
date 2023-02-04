import { reverse_cmap, set_reverse_cmap } from "../../cache"
import { remove_all_children } from "../../dom"
import { Canvas } from "../../types/canvas"
import { add_all_groups } from "./dom"

export function add_reverse_checkbox(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  dropdown: HTMLElement
): void {
  const div = document.createElement('div')
  div.className = 'space-between-div reverse-cmap-container'

  const label = document.createElement('label')
  label.className = 'pointer-cursor'
  label.htmlFor = 'reverse-cmap'
  label.innerText = 'Reverse'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'reverse-cmap'
  checkbox.checked = reverse_cmap
  checkbox.onclick = (): void => {
    set_reverse_cmap(!reverse_cmap)
    remove_all_children(dropdown)
    add_reverse_checkbox(simulation_canvas, btn, dropdown)
    add_all_groups(simulation_canvas, btn, reverse_cmap, dropdown)
    // FIXME: the dropdown disappears, but there's nothing that made
    // it disappear; debugger shows that it is visible after the last line
    // some code that was running after the function is causing this
  }

  div.appendChild(label)
  div.appendChild(checkbox)
  dropdown.appendChild(div)
}


