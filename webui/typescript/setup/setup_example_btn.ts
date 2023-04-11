import { import_json } from "../import"
import { Save } from "../types/cache"
import { AllCanvases } from "../types/canvas"
import { hide_dropdown } from "./dropdown"

export function setup_example_button(
  all_canvases: AllCanvases,
  worker: Worker
): void {
  const btn = document.getElementById('example-btn')!
  const dropdown = document.getElementById('example-dropdown')!

  btn.addEventListener('click', () => {
    if (dropdown.style.display === 'none') {
      dropdown.style.display = 'flex'
      const listener = (e: Event): void =>
        hide_dropdown('example-dropdown', btn, dropdown, listener, e)
      document.body.addEventListener('click', listener)
    } else {
      dropdown.style.display = 'none'
    }
  })

  const close_btn = document.getElementById('close-btn')!
  close_btn.addEventListener('click', () => {
    dropdown.style.display = 'none'
  })

  const figs = dropdown.getElementsByClassName('clickable-fig')

  Array.from(figs).forEach(fig => {
    fig.addEventListener('click', () => {
      const caption = fig.getElementsByTagName('figcaption')[0] as HTMLElement
      const label = caption.innerText
      const filename = label.replaceAll(' ', '_').toLowerCase() + '.json'
      fetch(filename)
        .then((response) => response.json())
        .then((cache: Save) => {
          import_json(all_canvases, cache, worker)
        })
    })
  })
}

