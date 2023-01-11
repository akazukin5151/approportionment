import { setup_form_handler } from './setup/setup_form'
import { setup_worker } from './setup/setup_worker'
import { load_cmaps, setup_indicator } from './setup/setup_page'
import { plot_default } from './plot/plot_party';
import { setup_party_table } from './party_table/setup_party_table';
import { setup_coalition_table } from './coalition_table/setup_coalition_table';
import { setup_canvas } from './setup/setup_canvas';

function main(): void {
  load_cmaps()
  setup_indicator()
  const party_canvas = setup_canvas(1)
  setup_party_table(party_canvas)
  setup_coalition_table()

  plot_default(party_canvas);

  const simulation_canvas = setup_canvas(0)
  const progress = document.querySelector('progress')!
  const worker = setup_worker(simulation_canvas, progress)
  setup_form_handler(progress, worker)
}

main()

