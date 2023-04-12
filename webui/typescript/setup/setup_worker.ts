import { SimulationResult, SimulationResults } from '../types/election';
import { AllCanvases, Canvas } from '../types/canvas';
import { WasmResult } from '../types/wasm'
import { party_manager, set_cache } from '../cache';
import { CANVAS_SIDE_SQUARED } from '../constants';
import { show_error_dialog } from '../dom';
import { plot_simulation } from '../plot/initial';
import { ProgressBar } from '../progress';
import { handle_random_point } from '../party_table/random_point';

/** This caches the raw results, building up incremental results for every
 * single election. Only used if real_time_progress_bar is on.
 **/
let cc: SimulationResults = []

const N_CHUNKS = 5

export function setup_worker(
  all_canvases: AllCanvases,
  progress: ProgressBar,
): Worker {
  const worker =
    new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<WasmResult>): void => {
    const err = msg.data.error
    if (err) {
      show_error_dialog(err)
      progress.set_percentage(0)
      return;
    }

    if (msg.data.point !== null && msg.data.coalition_num !== null) {
      return handle_random_point(
        msg.data.point, msg.data.coalition_num, all_canvases
      )
    }

    const finished = handle_plot(msg.data, progress, all_canvases.simulation)

    if (finished) {
      reset_buttons()
      party_manager.party_changed = false
    }
  }
  return worker
}

function reset_buttons(): void {
  const run_btn = document.getElementById('run-btn') as HTMLFormElement
  run_btn['disabled'] = false
  run_btn.onclick = (): void => set_cache(null);

  ['export-btn', 'save-btn'].forEach(name => {
    const btn = document.getElementById(name) as HTMLButtonElement
    btn['disabled'] = false
  })
}

function handle_plot(
  data: WasmResult,
  progress: ProgressBar,
  canvas: Canvas,
): boolean {
  if (data.counter != null && data.single_answer) {
    if (data.counter === CANVAS_SIDE_SQUARED) {
      return handle_one_by_one_complete(progress, canvas)
    }
    return handle_one_by_one_step(
      data.single_answer, data.real_time_progress_bar, data.counter, progress
    )
  } else if (data.answer) {
    return handle_batch(data.answer, progress, canvas)
  }
  return true
}

function handle_one_by_one_complete(
  progress: ProgressBar,
  canvas: Canvas,
): boolean {
  plot_simulation(canvas, cc)
  cc = []
  // if real_time_progress_bar is false, it is currently indeterminate.
  // as we are finished, we still have to stop the bar
  progress.reset()
  return true
}

function handle_one_by_one_step(
  single_answer: SimulationResult,
  real_time_progress_bar: boolean | null,
  counter: number,
  progress: ProgressBar,
): boolean {
  cc.push(single_answer)
  if (real_time_progress_bar === true) {
    const pct = Math.floor((counter / CANVAS_SIDE_SQUARED * 100))
    // chunk the progress bar updates to make it faster
    if (pct % N_CHUNKS === 0) {
      progress.set_percentage(pct)
    }
  }
  return false
}

function handle_batch(
  answer: SimulationResults,
  progress: ProgressBar,
  canvas: Canvas,
): boolean {
  cc = answer
  plot_simulation(canvas, cc)
  progress.stop_indeterminate()
  return true
}

