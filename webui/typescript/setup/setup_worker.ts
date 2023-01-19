import { Canvas, SimulationResults, WasmResult } from '../types';
import { load_parties } from '../form';
import { set_cache, set_party_changed } from '../cache';
import { plot_colors_to_canvas } from '../canvas';
import { calculate_colors_and_legend } from '../process_results';
import { rebuild_legend } from '../plot/replot';

/** This caches the raw results, building up incremental results for every
 * single election. Only used if real_time_progress_bar is on.
 **/
let cc: SimulationResults = []

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
      const run_btn = document.getElementById('run-btn') as HTMLFormElement
      run_btn['disabled'] = false
      run_btn.onclick = (): void => set_cache(null)

      const export_btn = document.getElementById('export-btn') as HTMLButtonElement
      export_btn['disabled'] = false

      set_party_changed(false)
    }
  }
  return worker
}

function handle_plot(
  data: WasmResult,
  progress: HTMLProgressElement,
  canvas: Canvas,
): boolean {
  if (data.counter && data.single_answer) {
    // 200 * 200 = 40000
    if (data.counter === 40000) {
      plot_simulation(canvas, cc)
      cc = []
      progress.value = 0
      return true
    }
    cc.push(data.single_answer)
    // 100 / 40000
    const pct = Math.floor((data.counter / 400))
    // chunk the progress bar updates to make it faster
    if (pct % 5 === 0) {
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
  plot_colors_to_canvas(canvas, 0, colors)
  const cache = {
    cache: cc,
    colors,
    legend,
    parties: load_parties()
  }
  set_cache(cache)
  rebuild_legend(canvas, cache)
}
