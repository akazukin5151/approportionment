import { load_parties } from '../form';
import { WasmRunArgs } from '../types';

export function setup_form_handler(
  worker: Worker,
  progress: HTMLProgressElement
): void {
  const form = document.getElementById("myform");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const btn = event.submitter as HTMLFormElement
    btn['disabled'] = true

    const fd = new FormData(form as HTMLFormElement);

    const real_time_progress_bar = fd.get('real_time_progress') === 'on'

    if (!real_time_progress_bar) {
      progress.removeAttribute('value')
    }

    const parties = load_parties()
      .map(p => ({ x: p.grid_x, y: p.grid_y, name: null, color: null }))

    const msg: WasmRunArgs = {
      parties,
      method: fd.get('method') as string,
      n_seats: parseInt(fd.get('n_seats') as string),
      n_voters: parseInt(fd.get('n_voters') as string),
      real_time_progress_bar
    }
    worker.postMessage(msg);
  });
}
