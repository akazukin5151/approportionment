import { setup_form_handler } from './setup/setup_form'
import { setup_worker } from './setup/setup_worker'
import { load_cmaps } from './setup/setup_page'
import { setup_party_table } from './party_table/setup_party_table';
import { setup_coalition_table } from './coalition_table/setup_coalition_table';
import { plot_party_with_listeners } from './plot/party/plot_party';
import { load_parties } from './load_parties';
import { setup_canvas } from './canvas';

function main(): void {
  load_cmaps()
  const chart = document.getElementById('chart')!
  const party_canvas = setup_canvas(1, chart)
  setup_party_table(party_canvas)
  setup_coalition_table()

  plot_party_with_listeners(party_canvas, load_parties());

  const simulation_canvas = setup_canvas(0, chart)
  const progress = document.querySelector('progress')!
  const worker = setup_worker(simulation_canvas, progress)
  setup_form_handler(worker, progress)
}

main()

