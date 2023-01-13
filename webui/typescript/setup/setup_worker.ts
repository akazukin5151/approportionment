import { Canvas, SimulationPoint, SimulationResult, WasmResult } from '../types';
import { plot_simulation } from '../plot/plot_simulation';

export let cache: Array<SimulationPoint> | null = null
let cc: SimulationResult = []

export function setup_worker(
  canvas: Canvas,
  progress: HTMLProgressElement
): Worker {
  const worker =
    new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<WasmResult>) => {
    const btn = document.getElementById('run-btn') as HTMLFormElement
    btn['disabled'] = false
    const err = msg.data.error
    if (err) {
      window.alert(err);
      progress.value = 0;
      return;
    }
    if (msg.data.counter && msg.data.single_answer) {
      // 200 * 200 = 40000
      if (msg.data.counter === 40000) {
        cache = plot_simulation(canvas, progress, cc)
        cc = []
        progress.value = 0
      } else {
        cc.push(msg.data.single_answer)
        // 100 / 40000
        const pct = Math.floor((msg.data.counter / 400))
        // chunk the progress bar updates to make it faster
        if (pct % 5 === 0) {
          progress.value = pct
        }
      }
    } else if (msg.data.answer) {
      cache = plot_simulation(canvas, progress, msg.data.answer!)
    }

    btn.onclick = () => cache = null
  }
  return worker
}

