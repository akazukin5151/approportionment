import * as PIXI from 'pixi.js'
import { Point, WorkerMessage } from './types';
import { plot_simulation } from './plot_simulation';

export let cache: Array<Point> | null = null

export function setup_worker(
  stage: PIXI.Container,
  progress: HTMLProgressElement
): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<WorkerMessage>) => {
    const btn = document.getElementById('run-btn') as HTMLFormElement
    btn['disabled'] = false
    const err = msg.data.error
    if (err) {
      window.alert(err);
      progress.value = 0;
      return;
    }
    cache = plot_simulation(stage, progress, msg)
    btn.onclick = () => cache = null
  }
  return worker
}

