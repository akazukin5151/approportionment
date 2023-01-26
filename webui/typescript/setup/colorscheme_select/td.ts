import { COLORMAP_ND, CONTINUOUS_CMAPS, DISCRETE_CMAPS } from '../../cmaps';
import { Canvas } from '../../types/core';
import { replot } from '../../plot/replot';
import {
  plot_blended,
  plot_continuous,
  plot_discrete
} from './cmap_previews';

export function add_all_groups(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  reverse: boolean,
  dropdown: HTMLElement,
): void {
  dropdown.appendChild(add_cmap_group(
    simulation_canvas, btn, reverse,
    DISCRETE_CMAPS, 'Discrete', plot_discrete
  ))
  dropdown.appendChild(create_hr())

  dropdown.appendChild(add_cmap_group(
    simulation_canvas, btn, reverse,
    CONTINUOUS_CMAPS, 'Continuous', plot_continuous
  ))
  dropdown.appendChild(create_hr())

  dropdown.appendChild(add_cmap_group(
    simulation_canvas, btn, reverse,
    COLORMAP_ND, 'Blended', plot_blended
  ))
}

function create_hr(): HTMLHRElement {
  const hr = document.createElement('hr')
  hr.style.width = '90%'
  return hr
}

function add_cmap_group(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  reverse: boolean,
  cmap: Array<string>,
  label: string,
  set_style: (name: string, reverse: boolean) => (div: HTMLDivElement) => void
): HTMLDivElement {
  const group_container = document.createElement('div')
  group_container.appendChild(create_group_label(label))

  cmap.forEach(cmap => {
    const item = document.createElement('div')
    item.className = 'cmap_item'
    item.appendChild(create_ramp(set_style(cmap, reverse)))
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

function create_group_label(label: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'cmap-label'

  const b = document.createElement('b')
  b.innerText = label

  p.appendChild(b)
  return p
}

