import { COLORMAP_ND, CONTINUOUS_CMAPS, DISCRETE_CMAPS } from '../cmaps';
import { Canvas } from '../types/core';
import { replot } from '../plot/replot';
import { set_dropdown_position } from './colorscheme_select/dropdown_position';
import {
  plot_blended,
  plot_continuous,
  plot_discrete
} from './colorscheme_select/cmap_previews';

export function setup_cmaps(simulation_canvas: Canvas): void {
  const btn = document.getElementById('cmap_select_btn')!
  btn.onclick = (): void => toggle_cmap_select(btn)

  const dropdown = document.getElementById('cmap_select')!
  dropdown.style.display = 'none'

  add_all_groups(simulation_canvas, btn, dropdown)
  set_dropdown_position(btn, dropdown)
}

function add_all_groups(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  dropdown: HTMLElement,
): void {
  dropdown.appendChild(add_cmap_group(
    simulation_canvas, btn,
    DISCRETE_CMAPS, 'Discrete', plot_discrete
  ))
  dropdown.appendChild(create_hr())

  dropdown.appendChild(add_cmap_group(
    simulation_canvas, btn,
    CONTINUOUS_CMAPS, 'Continuous', plot_continuous
  ))
  dropdown.appendChild(create_hr())

  dropdown.appendChild(add_cmap_group(
    simulation_canvas, btn,
    COLORMAP_ND, 'Blended', plot_blended
  ))
}

function create_hr(): HTMLHRElement {
  const hr = document.createElement('hr')
  hr.style.width = '90%'
  return hr
}

function toggle_cmap_select(btn: HTMLElement): void {
  const dropdown = document.getElementById('cmap_select')!
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'initial'
  } else {
    dropdown.style.display = 'none'
  }
  const listener = (evt: Event): void => {
    if (evt.target !== btn) {
      dropdown.style.display = 'none'
      document.body.removeEventListener('click', listener)
    }
  }
  document.body.addEventListener('click', listener)
}

function create_group_label(label: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'cmap-label'

  const b = document.createElement('b')
  b.innerText = label

  p.appendChild(b)
  return p
}

function add_cmap_group(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  cmap: Array<string>,
  label: string,
  set_style: (name: string) => (div: HTMLDivElement) => void
): HTMLDivElement {
  const group_container = document.createElement('div')
  group_container.appendChild(create_group_label(label))

  cmap.forEach(cmap => {
    const item = document.createElement('div')
    item.className = 'cmap_item'
    item.appendChild(create_ramp(set_style(cmap)))
    item.appendChild(document.createTextNode(cmap))
    item.onclick = (): void => {
      btn.innerText = cmap
      replot(simulation_canvas)
    }
    group_container.appendChild(item)
  })
  return group_container
}

function create_ramp(set_style: (div: HTMLDivElement) => void): HTMLElement {
  const container = document.createElement('div')
  container.className = 'cmap_item_color'
  set_style(container)
  return container
}
