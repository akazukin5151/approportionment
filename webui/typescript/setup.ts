import * as PIXI from 'pixi.js'
import { Simulation, Party, InfoGraphics, Point, WorkerMessage } from './types';
import { DEFAULT_PARTIES } from './constants';
import { unscale_x, unscale_y } from './utils';
import { plot_simulation } from './plot_simulation';

export let cache: Point[] | null = null

export function load_parties(stage: PIXI.Container): Array<Party> {
  const elems = stage.children;
  if (elems && elems.length !== 0) {
    return Array.from(elems)
      // For some reason, there are extra children in the stage after moving
      // the party points
      .filter(elem => elem instanceof InfoGraphics && elem.num !== undefined)
      .map((e) => {
        const elem = e as InfoGraphics
        const cx = elem.x
        const cy = elem.y
        const x = unscale_x(cx)
        const y = unscale_y(cy)
        const color: number = elem.color
        const num: number = elem.num
        return { x, y, color, num }
      })
      .sort((a, b) => a.num - b.num)
  }
  return DEFAULT_PARTIES
}

export function setup_worker(
  stage: PIXI.Container,
  progress: HTMLProgressElement
): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (msg: MessageEvent<WorkerMessage>) => {
    const err = msg.data.error
    if (err) {
      window.alert(err);
      progress.value = 0;
      return;
    }
    cache = plot_simulation(stage, progress, msg)
    const btn = document.getElementById('run-btn') as HTMLFormElement
    btn.disabled = false
    btn.onclick = () => cache = null
  }
  return worker
}

export function setup_form_handler(
  stage: PIXI.Container,
  progress: HTMLProgressElement,
  worker: Worker
) {
  const form = document.getElementById("myform");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const btn = event.submitter as HTMLFormElement
    btn.disabled = true

    const fd = new FormData(form as HTMLFormElement);
    const method = fd.get('method');
    const n_seats = parseInt(fd.get('n_seats') as string);
    const n_voters = parseInt(fd.get('n_voters') as string);

    progress.removeAttribute('value');
    const parties = load_parties(stage)
    worker.postMessage({
      parties,
      method,
      n_seats,
      n_voters,
    });
  });
}
