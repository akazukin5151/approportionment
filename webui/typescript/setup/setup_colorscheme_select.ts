import { remove_all_children } from '../dom';
import { Canvas } from '../types/canvas';
import { set_dropdown_position } from './colorscheme_select/dropdown_position';
import { add_all_groups } from './colorscheme_select/dom';
import { reverse_cmap, set_reverse_cmap } from '../cache';

export function setup_cmaps(simulation_canvas: Canvas): void {
  const btn = document.getElementById('cmap_select_btn')!
  btn.onclick = (): void => toggle_cmap_select(btn)

  const dropdown = document.getElementById('cmap_select')!
  dropdown.style.display = 'none'
  const container = document.createElement('div')
  container.className = 'w-100'

  add_scroll_buttons(dropdown)
  add_reverse_checkbox(simulation_canvas, btn, container)
  add_all_groups(simulation_canvas, btn, reverse_cmap, container)
  set_dropdown_position(btn, dropdown)
  dropdown.appendChild(container)
}

function toggle_cmap_select(btn: HTMLElement): void {
  const dropdown = document.getElementById('cmap_select')!
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'flex'
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
    evt.preventDefault()
    dropdown.style.display = 'none'
    document.body.removeEventListener('click', listener)
  }
}

function add_reverse_checkbox(
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

function add_scroll_buttons(dropdown: HTMLElement): void {
  const div = document.createElement('div')
  div.className = 'scroll-indicator'
  const labels = ['D', 'C', 'B', 'P']
  for (let i = 0; i < labels.length; i++) {
    const btn = document.createElement('button')
    btn.innerText = labels[i]!
    btn.className = 'scroll-btn'
    btn.onclick = (): void => {
      const elem = document.getElementsByClassName('cmap-label')[i] as HTMLElement
      const pos = elem.offsetTop
      dropdown.scrollTop = pos
    }
    div.appendChild(btn)
  }
  dropdown.appendChild(div)
}

