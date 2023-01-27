import { setup_form_handler } from './setup/setup_form'
import { setup_worker } from './setup/setup_worker'
import { setup_cmaps } from './setup/setup_colorscheme_select'
import { setup_party_table } from './party_table/setup_party_table';
import { setup_coalition_table } from './coalition_table/setup_coalition_table';
import { plot_party_with_listeners } from './plot/party/plot_party';
import { load_parties } from './form';
import { setup_all_canvases } from './canvas';
import { setup_export_button } from './setup/setup_export_btn';
import { preplot } from './color_wheel/preplot';
import { plot_default_result } from './plot/default';
import { setup_voronoi } from './setup/setup_voronoi';

export let preplot_canvas: HTMLCanvasElement | null = null

function main(): void {
  const chart = document.getElementById('chart')!
  const all_canvases = setup_all_canvases(chart)
  setup_cmaps(all_canvases.simulation)
  setup_party_table(all_canvases)
  setup_coalition_table()

  plot_party_with_listeners(all_canvases, load_parties())

  const progress = document.getElementsByTagName('progress')[0]!
  const worker = setup_worker(all_canvases.simulation, progress)
  setup_form_handler(worker, progress)
  setup_voronoi(all_canvases)
  setup_export_button()

  // timings show this is around 80-100 ms
  // ideally it would be in a separate worker but it's fast enough
  // the initial plotting and switching colorschemes rapidly has gotten
  // faster so it's already worth it for a one off calculation
  preplot_canvas = preplot()

  plot_default_result(all_canvases.simulation)
}

try {
  main()
} catch (e) {
  const code = document.getElementById('alert-msg')
  if (code && e instanceof Error) {
    code.innerText = e.message
    const alert_ = code.parentNode as HTMLElement
    const alert_container = alert_.parentNode as HTMLElement
    alert_container.className = 'alert-container'
  }
}

