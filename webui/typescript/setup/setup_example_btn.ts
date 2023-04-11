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
  const win = document.getElementById('example-win')!

  btn.addEventListener('click', () => on_btn_click(btn, win))

  const close_btn = document.getElementById('close-btn')!
  close_btn.addEventListener('click', () => close_win(win))
  setup_figures(all_canvases, worker, win)
}

function on_btn_click(btn: HTMLElement, win: HTMLElement): void {
  if (win.style.display === 'none') {
    win.style.display = 'flex'
    const listener = (e: Event): void =>
      hide_dropdown('example-win', btn, win, listener, e)
    document.body.addEventListener('click', listener)
    if (window.innerWidth <= DESKTOP_WIDTH) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    close_win(win)
  }
}

function close_win(win: HTMLElement): void {
  win.style.display = 'none'
  if (window.innerWidth <= DESKTOP_WIDTH) {
    document.body.style.overflow = 'unset'
  }
}

function setup_figures(
  all_canvases: AllCanvases,
  worker: Worker,
  win: HTMLElement
): void {
  const figs = win.getElementsByClassName('clickable-fig')

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

