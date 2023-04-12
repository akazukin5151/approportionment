import { party_manager } from '../cache';
import { CANDIDATE_BASED_METHODS } from '../constants';
import { ProgressBar } from '../progress';
import { XY } from '../types/position';
import { WasmRunArgs } from '../types/wasm';

export function setup_form_handler(
  worker: Worker,
  progress: ProgressBar,
): void {
  const form = document.getElementById("myform") as HTMLFormElement
  form.addEventListener('change', pulse_button)

  const method_select = form.elements.namedItem('method')
  if (method_select instanceof Element) {
    method_select.addEventListener('change', on_method_change)
  }

  const run_btn = document.getElementById('run-btn') as HTMLInputElement
  run_btn.addEventListener("click",
    () => run_worker(worker, progress, form, run_btn)
  )
}

function pulse_button(): void {
  const btn = document.getElementById('run-btn')!;
  btn.className = 'pulsing-color'
}

function on_method_change(this: Element): void {
  const value = (this as HTMLSelectElement).value
  const btns = document.getElementsByClassName('near-btn')
  const col = document.getElementsByClassName('party-table-btn-td')
  if (CANDIDATE_BASED_METHODS.includes(value)) {
    for (const btn of btns) {
      (btn as HTMLElement).style.display = 'initial'
    }
    for (const td of col) {
      (td as HTMLElement).style.display = 'flex';
    }
  } else {
    for (const btn of btns) {
      (btn as HTMLElement).style.display = 'none'
    }
    for (const td of col) {
      (td as HTMLElement).style.display = 'table-cell';
    }
  }
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

  const radio_group = form.elements.namedItem('method') as RadioNodeList
  const method = get_radio(radio_group)!
  const msg = build_msg(fd, method, n_voters, real_time_progress_bar)
  worker.postMessage(msg);
}

function disable_run_btn(btn: HTMLInputElement): void {
  btn['disabled'] = true
  btn.className = ''
}

function build_msg(
  fd: FormData,
  method: string,
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

function get_radio(radio_group: RadioNodeList): string | null {
  for (const radio of Array.from(radio_group)) {
    const r = radio as HTMLInputElement
    if (r.checked) {
      return r.id
    }
  }
  return null
}

