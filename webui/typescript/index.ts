import { setup_form_handler } from './setup/setup_form'
import { setup_worker } from './setup/setup_worker'
import { load_cmaps, setup_indicator } from './setup/setup_page'
import { plot_default } from './plot/plot_party';
import { setup_pixi } from './setup/pixi_drag';
import { setup_party_table } from './party_table/setup_party_table';
import { setup_coalition_table } from './coalition_table/setup_coalition_table';

function main(): void {
  load_cmaps()
  setup_indicator()
  const stage = setup_pixi()
  setup_party_table(stage)
  setup_coalition_table()

  plot_default(stage);

  const progress = document.querySelector('progress')!
  const worker = setup_worker(stage, progress)
  setup_form_handler(stage, progress, worker)
}

main()

