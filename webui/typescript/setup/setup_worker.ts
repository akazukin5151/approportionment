import { Canvas, SimulationPoint, WasmResult } from '../types';
import { plot_simulation } from '../plot/plot_simulation';

export let cache: Array<SimulationPoint> | null = null

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
    cache = plot_simulation(canvas, progress, msg)
    btn.onclick = () => cache = null
  }
  return worker
}

