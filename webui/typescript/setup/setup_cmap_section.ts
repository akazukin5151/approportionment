import { Canvas } from '../types/canvas';
import { set_dropdown_position } from './colorscheme_select/dropdown_position';
import { add_all_groups } from './colorscheme_select/dom';
import { reverse_cmap } from '../cache';
import { toggle_cmap_select } from './colorscheme_select/toggle';
import { setup_reverse_checkbox } from './colorscheme_select/reverse_checkbox';
import { add_scroll_buttons } from './colorscheme_select/scroll_btns';
import { replot } from '../plot/replot';
import { get_cmap_name } from '../form';
import { BLENDED_CMAPS } from '../cmap_names/cmap_names';
import { DEFAULT_PARTIES } from '../defaults';

export function setup_cmap_section(simulation_canvas: Canvas): void {
  const btn = document.getElementById('cmap_select_btn')!
  const container = setup_cmap_select(simulation_canvas, btn)
  setup_reverse_checkbox(simulation_canvas, btn, container)
  setup_colorize_by(simulation_canvas)
  setup_contrast_checkbox(simulation_canvas)
}

function setup_cmap_select(
  simulation_canvas: Canvas,
  btn: HTMLElement
): HTMLDivElement {
  btn.onclick = (): void => toggle_cmap_select(btn)

  const dropdown = document.getElementById('cmap_select')!
  dropdown.style.display = 'none'
  const container = document.createElement('div')
  container.className = 'w-100'

  add_scroll_buttons(dropdown)
  add_all_groups(simulation_canvas, btn, reverse_cmap, container)
  set_dropdown_position(btn, dropdown)
  dropdown.appendChild(container)
  return container
}

function setup_contrast_checkbox(simulation_canvas: Canvas): void {
  document.getElementById('expand-points')!.addEventListener('click', () => {
    const cmap_name = get_cmap_name()
    if (BLENDED_CMAPS.includes(cmap_name)) {
      replot(simulation_canvas)
    }
  })
}

function setup_colorize_by(simulation_canvas: Canvas): void {
  const select = document.getElementById('colorize-by')!

  const party_group = document.createElement('optgroup')
  party_group.id = 'party-group'
  party_group.label = 'Party'
  DEFAULT_PARTIES.forEach(party => {
    const option = document.createElement('option')
    option.value = `Party ${party.num}`
    option.innerText = `Party ${party.num}`
    if (party.num === 2) {
      option.selected = true
    }
    party_group.appendChild(option)
  })
  select.appendChild(party_group)

  const coalition_group = document.createElement('optgroup')
  coalition_group.id = 'coalition-group'
  coalition_group.label = 'Coalition'
  select.appendChild(coalition_group)

  select.onchange = (): void => replot(simulation_canvas)
}

