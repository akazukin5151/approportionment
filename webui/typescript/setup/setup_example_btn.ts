import { computePosition } from "@floating-ui/dom"
import { import_json } from "../import"
import { Save } from "../types/cache"
import { AllCanvases } from "../types/canvas"

export function setup_example_button(all_canvases: AllCanvases): void {
  const btn = document.getElementById('example-btn')!
  btn.addEventListener('click', () => {
    toggle_example_dropdown(btn)
  })
  const div = document.getElementById('example-dropdown')!
  Array.from(div.children).forEach(button => {
    button.addEventListener('click', () => {
      const label = (button as HTMLElement).innerText
      const filename = label.replace(' ', '_').toLowerCase() + '.json'
      fetch(filename)
        .then((response) => response.json())
        .then((cache: Save) => {
          import_json(all_canvases, cache)
        })
    })
  })
}

function toggle_example_dropdown(btn: HTMLElement): void {
  const dropdown = document.getElementById('example-dropdown')!
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'flex'
    computePosition(btn, dropdown).then(({ x, y }) => {
      dropdown.style.left = `${x}px`
      dropdown.style.top = `${y}px`
    })
  } else {
    dropdown.style.display = 'none'
  }
}

