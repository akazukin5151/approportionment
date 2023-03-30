import * as d3 from 'd3-color'
import { set_cache } from './cache'
import { plot_colors_to_canvas } from './canvas'
import { remove_all_children } from './dom'
import { add_to_colorize_by, load_parties } from './form'
import { rebuild_legend } from './legend'
import { generic_new_row } from './party_table/create_party_table'
import { plot_party_with_listeners } from './plot/party/plot_party'
import { AppCache } from "./types/cache"
import { AllCanvases } from './types/canvas'

/** Import a JSON object as cache and replot **/
export function import_json(all_canvases: AllCanvases, cache: AppCache): void {
  // technically the import json type isn't AppCache - cache.legend.colors
  // expects d3.RGBColor to convert for the legend
  // this line converts it into d3.RGBColor
  // every other field are ultimately primitives that does not need to
  // be converted
  cache.legend.colors = cache.legend.colors.map(x => d3.rgb(x.r, x.g, x.b))
  set_cache(cache)

  const table = document.getElementById('party-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;
  remove_all_children(tbody)

  const name = 'Party'
  const group = document.getElementById(`${name.toLowerCase()}-group`)!
  remove_all_children(group)

  cache.parties.forEach((party, idx) => {
    generic_new_row(
      all_canvases, tbody, party.color,
      party.grid_x, party.grid_y, idx
    )
    // copied from setup_party_table
    const parties = load_parties()
    plot_party_with_listeners(all_canvases, parties)
    add_to_colorize_by(name, idx)
  })

  plot_colors_to_canvas(all_canvases.simulation, cache.colors)
  rebuild_legend(all_canvases.simulation, cache, 'Category10')
}

