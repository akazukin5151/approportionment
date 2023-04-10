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
import { setup_voronoi } from './setup/setup_voronoi';
import { show_error_dialog } from './dom';
import { ProgressBar } from './progress';
import { setup_import_btn } from './setup/setup_import_btn';
import { setup_example_button } from './setup/setup_example_btn';
import { AllCanvases } from './types/canvas';
import { Save } from './types/cache';
import { import_json } from './import';
import { setup_save_button } from './setup/setup_save_btn';

function main(): void {
  const chart = document.getElementById('chart')!
  const all_canvases = setup_all_canvases(chart)
  setup_cmap_section(all_canvases.simulation)

  const progress = new ProgressBar()
  const worker = setup_worker(all_canvases, progress)
  setup_party_table(all_canvases, worker)
  setup_coalition_table()

  plot_party_with_listeners(all_canvases, load_parties())

  setup_form_handler(worker, progress)
  setup_voronoi(all_canvases)
  setup_export_button()
  setup_save_button(all_canvases)
  setup_import_btn(all_canvases, worker)
  setup_example_button(all_canvases, worker)

  preplot_all()
  import_default_example(all_canvases, worker)
}

function import_default_example(
  all_canvases: AllCanvases,
  worker: Worker
): void {
  fetch('./square.json')
    .then((response) => response.json())
    .then((cache: Save) => {
      // we force the initial n_voters to 100, even though the default
      // uses 1000 voters, because 100 voters is faster, making a better
      // first experience on running. 1000 is used to make the initial
      // plot look better
      cache.n_voters = 100
      // we also force the initial seed to -1 so people aren't stuck
      // on one variation
      cache.seed = -1
      import_json(all_canvases, cache, worker)
    })
}

try {
  main()
} catch (e) {
  if (e instanceof Error) {
    show_error_dialog(e)
  }
}

