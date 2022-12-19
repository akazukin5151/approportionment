import { load_cmaps, setup_form_handler, setup_indicator, setup_worker } from './setup'
import { plot_default } from './plot';
import { setup_pixi } from './pixi';
import { setup_party_table } from './party_tables';

function main() {
  load_cmaps()
  setup_indicator()
  const stage = setup_pixi()
  setup_party_table(stage)

  plot_default(stage);

  const progress = document.querySelector('progress')
  const worker = setup_worker(stage, progress)
  setup_form_handler(progress, worker)
}

main()

