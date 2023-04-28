import { party_manager } from '../cache';
import { get_method } from '../form';
import { handle_strategy, parse_method } from '../method';
import { ProgressBar } from '../progress';
import { XY } from '../types/position';
import { Method, WasmRunArgs } from '../types/wasm';

export function setup_form_handler(
  worker: Worker,
  progress: ProgressBar,
): void {
  const form = document.getElementById("myform") as HTMLFormElement
  form.addEventListener('change', () => on_form_change(form))

  const run_btn = document.getElementById('run-btn') as HTMLInputElement
  run_btn.addEventListener("click",
    () => run_worker(worker, progress, form, run_btn)
  )
}

function on_form_change(form: HTMLFormElement): void {
  pulse_button()
  const method = get_method(form)
  handle_strategy(method)
}

function pulse_button(): void {
  const btn = document.getElementById('run-btn')!;
  btn.className = 'pulsing-color'
}

function run_worker(
  worker: Worker,
  progress: ProgressBar,
  form: HTMLFormElement,
  btn: HTMLInputElement,
): void {
  disable_run_btn(btn)

  const fd = new FormData(form)
  const real_time_progress_bar = fd.get('real_time_progress') === 'on'
  if (!real_time_progress_bar) {
    progress.start_indeterminate()
  }

  const n_voters = parseInt(fd.get('n_voters') as string)
  progress.set_transition_duration(n_voters)

  const method = get_method(form)!
  const m = parse_method(form, method)
  const msg = build_msg(fd, m, n_voters, real_time_progress_bar)
  worker.postMessage(msg);
}

function disable_run_btn(btn: HTMLInputElement): void {
  btn['disabled'] = true
  btn.className = ''
}

function build_msg(
  fd: FormData,
  method: Method,
  n_voters: number,
  real_time_progress_bar: boolean,
): WasmRunArgs {
  const parties: Array<XY> =
    party_manager.parties.map(p => ({ x: p.grid_x, y: p.grid_y }))
  const seed = parseInt(fd.get('seed') as string)

  return {
    parties,
    method,
    n_seats: parseInt(fd.get('n_seats') as string),
    n_voters,
    stdev: parseFloat(fd.get('stdev') as string),
    real_time_progress_bar,
    use_voters_sample: fd.get('use_voters_sample') === 'on',
    seed: seed === -1 || isNaN(seed) ? undefined : BigInt(seed),
    mean_x: null,
    mean_y: null,
    coalition_num: null,
  }
}

