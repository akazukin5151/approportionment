import { Canvas } from '../types/canvas';
import { set_dropdown_position } from './colorscheme_select/dropdown_position';
import { add_all_groups } from './colorscheme_select/dom';
import { reverse_cmap } from '../cache';
import { toggle_cmap_select } from './colorscheme_select/toggle';
import { add_reverse_checkbox } from './colorscheme_select/reverse_checkbox';
import { add_scroll_buttons } from './colorscheme_select/scroll_btns';

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
