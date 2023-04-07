import * as d3 from 'd3-color'
import { set_cache, set_reverse_cmap } from './cache'
import { plot_colors_to_canvas } from './canvas'
import { add_coalition } from './coalition_table/setup_coalition_table'
import { PARTY_CANVAS_SIZE } from './constants'
import { remove_all_children, show_error_dialog } from './dom'
import { get_form_input, parties_from_table } from './form'
import { rebuild_legend } from './legend'
import { add_party } from './party_table'
import {
  style_colorize_by,
  style_contrast,
  style_reverse_cmap
} from './setup/colorscheme_select/styles'
import { disable_voronoi } from './setup/setup_voronoi'
import { Coalition, Save } from "./types/cache"
import { AllCanvases } from './types/canvas'

/** Import a JSON object as cache and replot **/
export function import_json(
  all_canvases: AllCanvases,
  save: Save,
  worker: Worker
): void {
  try {
    import_json_inner(all_canvases, save, worker)
  } catch (e) {
    if (e instanceof Error) {
      show_error_dialog(e)
    }
  }
}

function import_json_inner(
  all_canvases: AllCanvases,
  save: Save,
  worker: Worker
): void {
  // technically the import json type isn't AppCache - cache.legend.colors
  // expects d3.RGBColor to convert for the legend
  // this line converts it into d3.RGBColor
  // every other field are ultimately primitives that does not need to
  // be converted
  save.result_cache.legend.colors =
    save.result_cache.legend.colors.map(x => d3.rgb(x.r, x.g, x.b))
  set_cache(save.result_cache)

  const tbody = clear_inputs(all_canvases)

  plot_parties_(save, all_canvases, tbody, worker)
  plot_colors_to_canvas(all_canvases.simulation, save.result_cache.colors)
  rebuild_legend(all_canvases.simulation, save.result_cache, 'Category10')
  rebuild_coalitions(save)
  rebuild_form(save)
}

function clear_inputs(all_canvases: AllCanvases): HTMLTableSectionElement {
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  const checkbox = document.getElementById('show_voronoi') as HTMLInputElement
  if (checkbox.checked) {
    disable_voronoi(all_canvases)
    checkbox.checked = false
  }

  const party_table = document.getElementById('party-table')!
  const party_tbody = party_table.getElementsByTagName("tbody")[0]!;
  remove_all_children(party_tbody)

  const coalition_table = document.getElementById('coalition-table')!
  const coalition_tbody = coalition_table.getElementsByTagName("tbody")[0]!;
  remove_all_children(coalition_tbody)

  const party_group = document.getElementById(`party-group`)!
  remove_all_children(party_group)

  const coalition_group = document.getElementById(`coalition-group`)!
  remove_all_children(coalition_group)

  return party_tbody
}

function plot_parties_(
  save: Save,
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement,
  worker: Worker
): void {
  save.result_cache.parties.forEach((party, idx) => {
    add_party(
      party.grid_x, party.grid_y, party.color, idx, all_canvases, tbody, worker
    )
  })
}

function rebuild_form(save: Save): void {
  const cmap_btn = document.getElementById('cmap_select_btn')!
  cmap_btn.innerText = save.colorscheme
  style_contrast(save.colorscheme)
  style_colorize_by(save.colorscheme)
  style_reverse_cmap(save.colorscheme)

  const colorize_select = document.getElementById('colorize-by') as HTMLInputElement
  colorize_select.value = save.party_to_colorize

  const reverse = document.getElementById('reverse-cmap') as HTMLInputElement
  reverse.checked = save.reverse_colorscheme
  set_reverse_cmap(save.reverse_colorscheme)

  const contrast = document.getElementById('expand-points') as HTMLInputElement
  contrast.checked = save.increase_contrast

  const form = document.getElementById("myform") as HTMLFormElement
  const method = form.elements.namedItem('method') as HTMLFormElement
  get_form_input(form, 'method').value = save.method;
  get_form_input(form, 'n_seats').value = save.n_seats.toString();
  get_form_input(form, 'n_voters').value = save.n_voters.toString();
  get_form_input(form, 'stdev').value = save.stdev.toString();
  get_form_input(form, 'seed').value = save.seed.toString();
  method.dispatchEvent(new Event('change'))
}

function rebuild_coalitions(save: Save): void {
  save.coalitions.forEach(coalition => {
    const num = coalition.coalition_num
    if (num !== null) {
      const table = document.getElementById('coalition-table')!;
      const tbody = table.getElementsByTagName("tbody")[0]!;
      add_coalition(tbody, num)
      set_party_table_coalition(coalition, num)
    }
  })
}

function set_party_table_coalition(
  coalition: Coalition,
  coalition_num: number
): void {
  coalition.parties.forEach(party_idx => {
    const row = parties_from_table().find(tr => {
      const td = tr.children[0] as HTMLElement
      const num = td.innerText
      return num === party_idx.toString()
    })
    if (row) {
      const td = row.children[5] as HTMLElement
      const select = td.children[0] as HTMLSelectElement
      const option = Array.from(select.children).find(elem => {
        const opt = elem as HTMLOptionElement
        return opt.value === coalition_num.toString()
      })
      if (option) {
        (option as HTMLOptionElement).selected = true
      }
    }
  })
}

