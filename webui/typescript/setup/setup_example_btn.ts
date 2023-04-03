import { import_json } from "../import"
import { Save } from "../types/cache"
import { AllCanvases } from "../types/canvas"
import { toggle_dropdown } from "./dropdown"

export function setup_example_button(
  all_canvases: AllCanvases,
  worker: Worker
): void {
  const btn = document.getElementById('example-btn')!
  const dropdown = document.getElementById('example-dropdown')!

  btn.addEventListener('click', () => {
    toggle_dropdown(btn, dropdown, 'example-dropdown')
  })

  Array.from(dropdown.children).forEach(button => {
    button.addEventListener('click', () => {
      const label = (button as HTMLElement).innerText
      const filename = label.replaceAll(' ', '_').toLowerCase() + '.json'
      fetch(filename)
        .then((response) => response.json())
        .then((cache: Save) => {
          import_json(all_canvases, cache, worker)
        })
    })
  })
}

