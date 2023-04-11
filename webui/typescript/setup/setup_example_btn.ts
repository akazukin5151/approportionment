import { import_json } from "../import"
import { Save } from "../types/cache"
import { AllCanvases } from "../types/canvas"
import { hide_dropdown } from "./dropdown"

const DESKTOP_WIDTH = 720

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
      if (window.innerWidth <= DESKTOP_WIDTH) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      close_modal(dropdown)
    }
  })

  const close_btn = document.getElementById('close-btn')!
  close_btn.addEventListener('click', () => {
    close_modal(dropdown)
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

function close_modal(dropdown: HTMLElement): void {
  dropdown.style.display = 'none'
  if (window.innerWidth <= DESKTOP_WIDTH) {
    document.body.style.overflow = 'unset'
  }
}
