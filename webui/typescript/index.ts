import { setup_form_handler } from './setup/setup_form'
import { setup_worker } from './setup/setup_worker'
import { setup_cmap_section } from './setup/setup_cmap_section'
import { setup_party_table } from './party_table/setup_party_table';
import { setup_coalition_table } from './coalition_table/setup_coalition_table';
import { plot_party_with_listeners } from './plot/party/plot_party';
import { load_parties } from './form';
import { setup_all_canvases } from './canvas';
import { setup_export_button } from './setup/setup_export_btn';
import { preplot_all } from './color_wheel/preplot';
import { plot_default_result } from './plot/default';
import { setup_voronoi } from './setup/setup_voronoi';
import { show_error_dialog } from './dom';
import { ProgressBar } from './progress';
import { setup_import_btn } from './setup/setup_import_btn';

function main(): void {
  const chart = document.getElementById('chart')!
  const all_canvases = setup_all_canvases(chart)
  setup_cmap_section(all_canvases.simulation)
  setup_party_table(all_canvases)
  setup_coalition_table()

  plot_party_with_listeners(all_canvases, load_parties())

  const progress = new ProgressBar()
  const worker = setup_worker(all_canvases.simulation, progress)
  setup_form_handler(worker, progress)
  setup_voronoi(all_canvases)
  setup_export_button()
  setup_import_btn(all_canvases)

  preplot_all()
  plot_default_result(all_canvases)
}

try {
  main()
} catch (e) {
  if (e instanceof Error) {
    show_error_dialog(e)
  }
}

