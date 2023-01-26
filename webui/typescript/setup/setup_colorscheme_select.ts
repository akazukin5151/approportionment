import { Canvas } from '../types/core';
import { set_dropdown_position } from './colorscheme_select/dropdown_position';
import { add_all_groups } from './colorscheme_select/td';

export function setup_cmaps(simulation_canvas: Canvas): void {
  const btn = document.getElementById('cmap_select_btn')!
  btn.onclick = (): void => toggle_cmap_select(btn)

  const dropdown = document.getElementById('cmap_select')!
  dropdown.style.display = 'none'

  add_all_groups(simulation_canvas, btn, dropdown)
  set_dropdown_position(btn, dropdown)
}

function toggle_cmap_select(btn: HTMLElement): void {
  const dropdown = document.getElementById('cmap_select')!
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'initial'
    const listener = (e: Event): void => hide_dropdown(btn, dropdown, listener, e)
    document.body.addEventListener('click', listener)
  } else {
    dropdown.style.display = 'none'
  }
}

function hide_dropdown(
  btn: HTMLElement,
  dropdown: HTMLElement,
  listener: (evt: Event) => void,
  evt: Event
): void {
  evt.preventDefault()
  if (!evt.target || !(evt.target instanceof HTMLElement)) {
    return
  }
  let p: ParentNode | null = evt.target
  while (p) {
    if ('id' in p && p.id === 'cmap_select') {
      return
    }
    p = p.parentNode
  }
  if (evt.target !== btn) {
    dropdown.style.display = 'none'
    document.body.removeEventListener('click', listener)
  }
}
