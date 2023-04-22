import * as d3 from 'd3-color'
import { get_middle } from './bar_chart'
import { coalition_bar_chart, party_bar_chart, party_manager, set_cache, set_reverse_cmap } from './cache'
import { plot_colors_to_canvas } from './canvas'
import { all_coalition_seats } from './coalition_table/coalition_table'
import { add_coalition } from './coalition_table/add_coalition'
import { PARTY_CANVAS_SIZE } from './constants'
import { remove_all_children, show_error_dialog } from './dom'
import { get_form_input, set_radio } from './form'
import { rebuild_legend } from './legend'
import { add_party } from './party/add_party'
import {
  style_contrast,
  style_reverse_cmap
} from './setup/colorscheme_select/styles'
import { disable_voronoi } from './voronoi'
import { Save } from "./types/cache"
import { AllCanvases, Canvas } from './types/canvas'
import { ColorizeBy } from './types/core'

/** Import a JSON object as cache and replot **/
export function import_json(
  all_canvases: AllCanvases,
  save: Save,
): void {
  try {
    import_json_inner(all_canvases, save)
  } catch (e) {
    if (e instanceof Error) {
      show_error_dialog(e)
    }
  }
}

function import_json_inner(
  all_canvases: AllCanvases,
  save: Save,
): void {
  // technically the import json type isn't AppCache - cache.legend.colors
  // expects d3.RGBColor to convert for the legend
  // this line converts it into d3.RGBColor
  // every other field are ultimately primitives that does not need to
  // be converted
  save.result_cache.legend.colors =
    save.result_cache.legend.colors.map(x => d3.rgb(x.r, x.g, x.b))
  set_cache(save.result_cache)

  party_manager.parties = []
  party_manager.coalitions.clear()
  clear_inputs(all_canvases)

  const coalitions_by_party = save.result_cache.parties.map(party =>
    save.coalitions
      .find(coalition => coalition.parties.includes(party.num))
      ?.coalition_num ?? null
  )
  rebuild_coalitions(save, all_canvases.simulation, save.party_to_colorize)
  plot_parties_(save, all_canvases, coalitions_by_party, save.party_to_colorize)
  plot_colors_to_canvas(all_canvases.simulation, save.result_cache.colors)
  // TODO: shouldn't this result cache be written to the cache as well
  const seats_by_party = get_middle(save.result_cache)
  party_bar_chart.plot(seats_by_party)
  const bar_values = all_coalition_seats(seats_by_party)
  coalition_bar_chart.plot(bar_values)
  rebuild_legend(all_canvases.simulation, save.result_cache, 'Category10')
  rebuild_form(save)
}

function clear_inputs(all_canvases: AllCanvases): void {
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  const checkbox = document.getElementById('show_voronoi') as HTMLInputElement
  if (checkbox.checked) {
    disable_voronoi(all_canvases)
    checkbox.checked = false
  }

  party_bar_chart.clear()
  coalition_bar_chart.clear()

  const coalition_table = document.getElementById('coalition-table')!
  const coalition_tbody = coalition_table.getElementsByTagName("tbody")[0]!;
  while (coalition_tbody.children.length > 1) {
    coalition_tbody.removeChild(coalition_tbody.firstChild!)
  }
  const none_row = coalition_tbody.lastElementChild!
  const none_td = none_row.children[1]!
  const none_container = none_td.children[0] as HTMLElement
  remove_all_children(none_container)
}

function plot_parties_(
  save: Save,
  all_canvases: AllCanvases,
  coalitions_by_party: Array<number | null>,
  colorize_by: ColorizeBy,
): void {
  save.result_cache.parties.forEach((party, idx) => {
    add_party(
      party_manager, party.grid_x, party.grid_y, party.color, idx, all_canvases,
      coalitions_by_party[idx] ?? null,
      colorize_by.quantity === 'party' && colorize_by.num === idx
    )
  })
}

function rebuild_form(save: Save): void {
  const cmap_btn = document.getElementById('cmap_select_btn')!
  cmap_btn.innerText = save.colorscheme
  style_contrast(save.colorscheme)
  style_reverse_cmap(save.colorscheme)

  const reverse = document.getElementById('reverse-cmap') as HTMLInputElement
  reverse.checked = save.reverse_colorscheme
  set_reverse_cmap(save.reverse_colorscheme)

  const contrast = document.getElementById('expand-points') as HTMLInputElement
  contrast.checked = save.increase_contrast

  const form = document.getElementById("myform") as HTMLFormElement
  const method = form.elements.namedItem('method') as RadioNodeList
  set_radio(method, save.method)
  get_form_input(form, 'n_seats').value = save.n_seats.toString();
  get_form_input(form, 'n_voters').value = save.n_voters.toString();
  get_form_input(form, 'stdev').value = save.stdev.toString();
  get_form_input(form, 'seed').value = save.seed.toString();
}

function rebuild_coalitions(
  save: Save,
  simulation_canvas: Canvas,
  colorize_by: ColorizeBy
): void {
  save.coalitions.forEach(coalition => {
    const num = coalition.coalition_num
    if (num !== null) {
      const table = document.getElementById('coalition-table')!;
      const tbody = table.getElementsByTagName("tbody")[0]!;
      add_coalition(
        tbody, num, simulation_canvas,
        colorize_by.quantity === 'coalition'
        && colorize_by.num === coalition.coalition_num
      )
    }
  })
}

