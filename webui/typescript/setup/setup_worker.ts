import { Canvas, SimulationResults, WasmResult } from '../types';
import { load_parties } from '../form';
import { set_cache, set_party_changed } from '../cache';
import { plot_colors_to_canvas } from '../canvas';
import { calculate_colors_and_legend } from '../process_results/process_results';
import { rebuild_legend } from '../plot/replot';
import { CANVAS_SIDE_SQUARED } from '../constants';

/** This caches the raw results, building up incremental results for every
 * single election. Only used if real_time_progress_bar is on.
 **/
let cc: SimulationResults = []

const N_CHUNKS = 5

export function setup_worker(
  canvas: Canvas,
  progress: HTMLProgressElement
): Worker {
  const worker =
    new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<WasmResult>): void => {
    const err = msg.data.error
    if (err) {
      window.alert(err.message);
      progress.value = 0;
      return;
    }

    const finished = handle_plot(msg.data, progress, canvas)

    if (finished) {
      reset_buttons()
      set_party_changed(false)
    }
  }
  return worker
}

function reset_buttons(): void {
  const run_btn = document.getElementById('run-btn') as HTMLFormElement
  run_btn['disabled'] = false
  run_btn.onclick = (): void => set_cache(null)

  const export_btn = document.getElementById('export-btn') as HTMLButtonElement
  export_btn['disabled'] = false
}

function handle_plot(
  data: WasmResult,
  progress: HTMLProgressElement,
  canvas: Canvas,
): boolean {
  if (data.counter != null && data.single_answer) {
    if (data.counter === CANVAS_SIDE_SQUARED) {
      plot_simulation(canvas, cc)
      cc = []
      progress.value = 0
      return true
    }
    cc.push(data.single_answer)
    const pct = Math.floor((data.counter / CANVAS_SIDE_SQUARED * 100))
    // chunk the progress bar updates to make it faster
    if (pct % N_CHUNKS === 0) {
      progress.value = pct
    }
    return false
  } else if (data.answer) {
    cc = data.answer!
    plot_simulation(canvas, cc)
    progress.value = 0;
  }
  return true
}

function plot_simulation(
  canvas: Canvas,
  r: SimulationResults
): void {
  const { colors, legend } = calculate_colors_and_legend(r)
  plot_colors_to_canvas(canvas, colors)
  const cache = {
    cache: cc,
    colors,
    legend,
    parties: load_parties()
  }
  set_cache(cache)
  rebuild_legend(canvas, cache)
}
