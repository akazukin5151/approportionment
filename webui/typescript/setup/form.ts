import { party_manager } from '../cache';
import { APPROVAL_METHODS, SCORE_METHODS } from '../constants';
import { get_method, get_strategy } from '../form';
import { ProgressBar } from '../progress';
import { XY } from '../types/position';
import { CardinalStrategy, Method, ReweightMethod, WasmRunArgs } from '../types/wasm';

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

export function handle_strategy(method: string): void {
  const a = toggle_strategy(method, 'approval-strategy', APPROVAL_METHODS)
  const s = toggle_strategy(method, 'score-strategy', SCORE_METHODS)
  const label = document.getElementById('strategy-label')!
  if (a || s) {
    label.style.display = 'block'
  } else {
    label.style.display = 'none'
  }
}

// we need a three-state enum, otherwise we can't distinguish between
// "it was not set yet" and "it was set, but then discovered we need to ignore"
type TriState = 'unset' | 'ignore' | HTMLInputElement

function toggle_strategy(
  method: string,
  name: string,
  matches: Array<string>
): boolean {
  const elems =
    document.getElementsByClassName(name) as HTMLCollectionOf<HTMLElement>
  const has_match = matches.includes(method)
  const display = has_match ? 'contents' : 'none'
  // this function can either be triggered due to a change in method
  // or a change in strategy.
  // if the latter, we don't want to change the checked box,
  // which is what 'ignore' does
  let first: TriState = 'unset'
  for (const elem of elems) {
    elem.style.display = display
    const checkbox = elem.children[0] as HTMLInputElement
    if (first === 'unset') {
      first = checkbox as TriState
    } else if (first !== 'ignore' && checkbox.checked) {
      // another checkbox was set, do not change it
      first = 'ignore'
    }
  }
  if (first !== 'unset' && first !== 'ignore') {
    // check or uncheck the first checkbox,
    // depending on if we are showing or hiding
    first.checked = has_match
  }
  return has_match
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

const STRATEGIES: { [css_id: string]: string } = {
  approve_mean: 'Mean',
  approve_median: 'Median',
  lerp_norm: 'NormedLinear',
  bullet: 'Bullet',
}

const THIELE_METHODS = ['Spav', 'Rrv']

function parse_method(
  form: HTMLFormElement,
  method: string
): Method {
  if (APPROVAL_METHODS.includes(method) || SCORE_METHODS.includes(method)) {
    const s = get_strategy(form)!
    const alloc = THIELE_METHODS.includes(method)
      ? 'Thiele'
      : { IterativeReweight: method as ReweightMethod }
    return { Cardinal: [STRATEGIES[s] as CardinalStrategy, alloc] }
  }
  if (method === 'StvAustralia') {
    return { StvAustralia: { normal: 1, min_party: 0, avg_party: 0 } }
  }
  return method as Method
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

