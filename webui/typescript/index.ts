import { setup_form_handler } from './setup/form'
import { setup_worker } from './setup/worker'
import { setup_cmap_section } from './setup/cmap_section'
import { setup_coalition_table } from './coalition_table/setup_coalition_table';
import { setup_party_canvas } from './setup/party_canvas/party_canvas';
import { setup_all_canvases } from './setup/canvas';
import { setup_export_button } from './setup/export_btn';
import { preplot_all } from './setup/colorwheel';
import { setup_voronoi } from './setup/voronoi';
import { show_error_dialog } from './dom';
import { ProgressBar } from './progress';
import { setup_import_btn } from './setup/import_btn';
import { setup_example_button } from './setup/example_btn';
import { AllCanvases } from './types/canvas';
import { Save } from './types/cache';
import { import_json } from './import';
import { setup_save_button } from './setup/save_btn';
import { setup_add_party } from './setup/add_party';

function main(): void {
  const chart = document.getElementById('chart')!
  const all_canvases = setup_all_canvases(chart)
  setup_cmap_section(all_canvases.simulation)

  const progress = new ProgressBar()
  const worker = setup_worker(all_canvases, progress)
  setup_coalition_table(all_canvases.simulation)

  setup_party_canvas(all_canvases, worker)
  setup_add_party(all_canvases)
  setup_form_handler(worker, progress)
  setup_voronoi(all_canvases)
  setup_export_button()
  setup_save_button(all_canvases)
  setup_import_btn(all_canvases)
  setup_example_button(all_canvases)

  preplot_all()
  import_default_example(all_canvases)
}

function import_default_example(
  all_canvases: AllCanvases,
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
      import_json(all_canvases, cache)
    })
}

try {
  main()
} catch (e) {
  if (e instanceof Error) {
    show_error_dialog(e)
  }
}
