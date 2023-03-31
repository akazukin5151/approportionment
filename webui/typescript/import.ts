import * as d3 from 'd3-color'
import { set_cache } from './cache'
import { plot_colors_to_canvas } from './canvas'
import { add_coalition } from './coalition_table/setup_coalition_table'
import { PARTY_CANVAS_SIZE } from './constants'
import { remove_all_children, show_error_dialog } from './dom'
import { add_to_colorize_by, load_parties, parties_from_table } from './form'
import { rebuild_legend } from './legend'
import { generic_new_row } from './party_table/create_party_table'
import { plot_party_with_listeners } from './plot/party/plot_party'
import { Coalition, Save } from "./types/cache"
import { AllCanvases } from './types/canvas'

/** Import a JSON object as cache and replot **/
export function import_json(all_canvases: AllCanvases, save: Save): void {
  try {
    import_json_inner(all_canvases, save)
  } catch (e) {
    if (e instanceof Error) {
      show_error_dialog(e)
    }
  }
}

function import_json_inner(all_canvases: AllCanvases, save: Save): void {
  // technically the import json type isn't AppCache - cache.legend.colors
  // expects d3.RGBColor to convert for the legend
  // this line converts it into d3.RGBColor
  // every other field are ultimately primitives that does not need to
  // be converted
  save.result_cache.legend.colors =
    save.result_cache.legend.colors.map(x => d3.rgb(x.r, x.g, x.b))
  set_cache(save.result_cache)

  const tbody = clear_inputs(all_canvases)

  plot_parties(save, all_canvases, tbody)
  plot_colors_to_canvas(all_canvases.simulation, save.result_cache.colors)
  rebuild_legend(all_canvases.simulation, save.result_cache, 'Category10')
  rebuild_coalitions(save)
  rebuild_form(save)
}

function clear_inputs(all_canvases: AllCanvases): HTMLTableSectionElement {
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)

  const party_table = document.getElementById('party-table')!
  const party_tbody = party_table.getElementsByTagName("tbody")[0]!;
  remove_all_children(party_tbody)

  const coalition_table = document.getElementById('coalition-table')!
  const coalition_tbody = coalition_table.getElementsByTagName("tbody")[0]!;
  remove_all_children(coalition_tbody)

  const group = document.getElementById(`party-group`)!
  remove_all_children(group)
  return party_tbody
}

function plot_parties(
  save: Save,
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement
): void {
  save.result_cache.parties.forEach((party, idx) => {
    generic_new_row(
      all_canvases, tbody, party.color,
      party.grid_x, party.grid_y, idx
    )
    // copied from setup_party_table
    const parties = load_parties()
    plot_party_with_listeners(all_canvases, parties)
    add_to_colorize_by('Party', idx)
  })
}

function rebuild_form(save: Save): void {
  const cmap_btn = document.getElementById('cmap_select_btn')!
  cmap_btn.innerText = save.colorscheme

  const colorize_select = document.getElementById('colorize-by') as HTMLInputElement
  colorize_select.value = save.party_to_colorize

  const form = document.getElementById("myform") as HTMLFormElement
  (form.elements.namedItem('method') as HTMLFormElement)['value'] = save.method;
  (form.elements.namedItem('n_seats') as HTMLFormElement)['value'] = save.n_seats;
  (form.elements.namedItem('n_voters') as HTMLFormElement)['value'] = save.n_voters;
  (form.elements.namedItem('stdev') as HTMLFormElement)['value'] = save.stdev;
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
