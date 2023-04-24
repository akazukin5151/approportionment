import { Canvas } from '../types/canvas';
import { set_dropdown_position } from './colorscheme_select/dropdown_position';
import { add_all_groups } from './colorscheme_select/dom';
import { reverse_cmap } from '../cache';
import { setup_reverse_checkbox } from './colorscheme_select/reverse_checkbox';
import { add_scroll_buttons } from './colorscheme_select/scroll_btns';
import { replot } from '../plot/replot';
import { get_cmap_name } from '../form';
import { BLENDED_CMAPS } from '../cmap_names/cmap_names';
import { toggle_dropdown } from './dropdown';

export function setup_cmap_section(simulation_canvas: Canvas): void {
  const btn = document.getElementById('cmap_select_btn')!
  const container = setup_cmap_select(simulation_canvas, btn)
  setup_reverse_checkbox(simulation_canvas, btn, container)
  setup_contrast_checkbox(simulation_canvas)
}

function setup_cmap_select(
  simulation_canvas: Canvas,
  btn: HTMLElement
): HTMLDivElement {
  const dropdown = document.getElementById('cmap_select')!
  btn.onclick = (): void => toggle_dropdown(btn, dropdown, 'cmap_select')
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
