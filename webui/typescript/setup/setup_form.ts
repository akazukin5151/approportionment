import { load_parties } from '../form';
import { ProgressBar } from '../progress';
import { XY } from '../types/position';
import { WasmRunArgs } from '../types/wasm';

export function setup_form_handler(
  worker: Worker,
  progress: ProgressBar
): void {
  const form = document.getElementById("myform") as HTMLFormElement
  form.addEventListener('change', pulse_button)
  const run_btn = document.getElementById('run-btn') as HTMLInputElement
  run_btn.addEventListener("click",
    () => run_worker(worker, progress, form, run_btn)
  )
}

function pulse_button(): void {
  const btn = document.getElementById('run-btn')!;
  btn.className = 'pulsing-color'
}

function run_worker(
  worker: Worker,
  progress: ProgressBar,
  form: HTMLFormElement,
  btn: HTMLInputElement
): void {
  disable_run_btn(btn)

  const fd = new FormData(form)
  const real_time_progress_bar = fd.get('real_time_progress') === 'on'

  if (!real_time_progress_bar) {
    progress.start_indeterminate()
  }

  const msg = build_msg(fd, real_time_progress_bar)
  worker.postMessage(msg);
}

function disable_run_btn(btn: HTMLInputElement): void {
  btn['disabled'] = true
  btn.className = ''
}

function build_msg(fd: FormData, real_time_progress_bar: boolean): WasmRunArgs {
  const parties: Array<XY> =
    load_parties().map(p => ({ x: p.grid_x, y: p.grid_y }))

  return {
    parties,
    method: fd.get('method') as string,
    n_seats: parseInt(fd.get('n_seats') as string),
    n_voters: parseInt(fd.get('n_voters') as string),
    stdev: parseFloat(fd.get('stdev') as string),
    real_time_progress_bar,
    use_voters_sample: fd.get('use_voters_sample') === 'on'
  }
}
