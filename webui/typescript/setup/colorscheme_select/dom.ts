import {
  BLENDED_CMAPS,
  CONTINUOUS_CMAPS,
  DISCRETE_CMAPS,
  PERMUTATION_CMAPS
} from '../../cmap_names/cmap_names';
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
  container: HTMLElement,
): void {
  const make_group = add_group(simulation_canvas, btn, reverse, container)
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
  container: HTMLElement,
): MakeGroup {
  return function(cmap: Array<string>,
    label: string,
    set_style: StyleSetter
  ): void {
    container.appendChild(add_cmap_group(
      simulation_canvas, btn, reverse,
      cmap, label, set_style
    ))
    container.appendChild(create_hr())
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

  cmap.forEach(color => {
    const item = document.createElement('div')
    item.className = 'cmap_item'
    item.appendChild(create_ramp(set_style(color, reverse)))
    item.appendChild(document.createTextNode(color))
    item.addEventListener('click',
      () => on_cmap_selected(btn, color, simulation_canvas)
    )
    group_container.appendChild(item)
  })
  return group_container
}

function on_cmap_selected(
  btn: HTMLElement,
  color: string,
  simulation_canvas: Canvas,
): void {
  btn.innerText = color
  replot(simulation_canvas)
  style_contrast(color)
  style_colorize_by(color)
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

function style_contrast(color: string): void {
  const contrast_label = document.getElementById('expand-points-label')!
  const contrast_container = contrast_label.parentElement!
  const contrast_checkbox =
    document.getElementById('expand-points') as HTMLInputElement

  if (BLENDED_CMAPS.includes(color)) {
    contrast_label.className = 'pointer-cursor'
    contrast_container.classList.remove('discouraged-color')
    contrast_checkbox.disabled = false
  } else {
    contrast_label.className = 'not-allowed-cursor'
    contrast_container.classList.add('discouraged-color')
    contrast_checkbox.disabled = true
  }
}

function style_colorize_by(color: string): void {
  const colorize_label = document.getElementById('colorize-by-label')!
  const colorize_container = colorize_label.parentElement!
  const colorize_select = document.getElementById('colorize-by') as HTMLInputElement

  if (DISCRETE_CMAPS.includes(color) || CONTINUOUS_CMAPS.includes(color)) {
    colorize_label.className = ''
    colorize_container.classList.remove('discouraged-color')
    colorize_select.disabled = false
  } else {
    colorize_label.className = 'not-allowed-cursor'
    colorize_container.classList.add('discouraged-color')
    colorize_select.disabled = true
  }
}

