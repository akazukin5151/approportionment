import { BLENDED_CMAPS, CONTINUOUS_CMAPS, DISCRETE_CMAPS, PERMUTATION_CMAPS } from '../../cmaps';
import { Canvas } from '../../types/canvas';
import { replot } from '../../plot/replot';
import {
  plot_blended,
  plot_continuous,
  plot_discrete,
  plot_permutations
} from './cmap_previews';

export function add_all_groups(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  reverse: boolean,
  dropdown: HTMLElement,
): void {
  const make_group = add_group(simulation_canvas, btn, reverse, dropdown)
  const data = [
    { cmap: DISCRETE_CMAPS, label: 'Discrete', styler: plot_discrete },
    { cmap: CONTINUOUS_CMAPS, label: 'Continuous', styler: plot_continuous },
    { cmap: BLENDED_CMAPS, label: 'Blended', styler: plot_blended },
    { cmap: PERMUTATION_CMAPS, label: 'Permutations', styler: plot_permutations },
  ]
  for (const d of data) {
    make_group(d.cmap, d.label, d.styler)
  }
}

type StyleSetter = (name: string, reverse: boolean) => (div: HTMLDivElement) => void

type MakeGroup = (
  cmap: Array<string>,
  label: string,
  set_style: StyleSetter
) => void

function add_group(
  simulation_canvas: Canvas,
  btn: HTMLElement,
  reverse: boolean,
  dropdown: HTMLElement,
): MakeGroup {
  return function(cmap: Array<string>,
    label: string,
    set_style: StyleSetter
  ): void {
    dropdown.appendChild(add_cmap_group(
      simulation_canvas, btn, reverse,
      cmap, label, set_style
    ))
    dropdown.appendChild(create_hr())
  }
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
  set_style: StyleSetter
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

