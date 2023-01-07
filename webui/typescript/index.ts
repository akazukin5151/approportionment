import { setup_form_handler } from './setup_form'
import { setup_worker } from './setup_worker'
import { load_cmaps, setup_indicator } from './setup_page'
import { plot_default } from './plot_party';
import { setup_pixi } from './pixi_drag';
import { setup_party_table } from './setup_party_table';
import { setup_coalition_table } from './setup_coalition_table';

function main() {
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

