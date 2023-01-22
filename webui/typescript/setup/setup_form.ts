import { load_parties } from '../form';
import { WasmParty, WasmRunArgs } from '../types/wasm';

export function setup_form_handler(
  worker: Worker,
  progress: HTMLProgressElement
): void {
  const form = document.getElementById("myform");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    disable_run_btn(event)

    const fd = new FormData(form as HTMLFormElement);
    const real_time_progress_bar = fd.get('real_time_progress') === 'on'

    if (!real_time_progress_bar) {
      progress.removeAttribute('value')
    }

    const msg = build_msg(fd, real_time_progress_bar)
    worker.postMessage(msg);
  });
}

function disable_run_btn(event: SubmitEvent): void {
  const btn = event.submitter as HTMLFormElement
  btn['disabled'] = true
}

function build_msg(fd: FormData, real_time_progress_bar: boolean): WasmRunArgs {
  const parties: Array<WasmParty> =
    load_parties()
      .map(p => ({ x: p.grid_x, y: p.grid_y, name: null, color: null }))

  return {
    parties,
    method: fd.get('method') as string,
    n_seats: parseInt(fd.get('n_seats') as string),
    n_voters: parseInt(fd.get('n_voters') as string),
    real_time_progress_bar
  }
}
