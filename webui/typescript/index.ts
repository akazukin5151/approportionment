import { setup_form_handler } from './setup/setup_form'
import { setup_worker } from './setup/setup_worker'
import { setup_cmaps } from './setup/setup_colorscheme_select'
import { setup_party_table } from './party_table/setup_party_table';
import { setup_coalition_table } from './coalition_table/setup_coalition_table';
import { plot_party_with_listeners } from './plot/party/plot_party';
import { load_parties } from './form';
import { setup_canvas } from './canvas';
import { setup_export_button } from './setup/setup_export_btn';
import { preplot } from './color_wheel/preplot';
import { plot_default_result } from './plot/default';

export let preplot_canvas: HTMLCanvasElement | null = null

function main(): void {
  const chart = document.getElementById('chart')!
  const party_canvas = setup_canvas(1, chart)
  const simulation_canvas = setup_canvas(0, chart)
  setup_cmaps(simulation_canvas)
  setup_party_table(party_canvas, simulation_canvas)
  setup_coalition_table()

  plot_party_with_listeners(party_canvas, load_parties());

  const progress = document.getElementsByTagName('progress')[0]!
  const worker = setup_worker(simulation_canvas, progress)
  setup_form_handler(worker, progress)
  setup_export_button()

  // timings show this is around 80-100 ms
  // ideally it would be in a separate worker but it's fast enough
  // the initial plotting and switching colorschemes rapidly has gotten
  // faster so it's already worth it for a one off calculation
  preplot_canvas = preplot()

  plot_default_result(simulation_canvas)
}

main()

