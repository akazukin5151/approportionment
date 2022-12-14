import * as PIXI from 'pixi.js'
import { load_parties } from '../load_parties';

export function setup_form_handler(
  stage: PIXI.Container,
  progress: HTMLProgressElement,
  worker: Worker
): void {
  const form = document.getElementById("myform");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const btn = event.submitter as HTMLFormElement
    btn['disabled'] = true

    const fd = new FormData(form as HTMLFormElement);

    progress.removeAttribute('value');
    const parties = load_parties(stage)
    worker.postMessage({
      parties,
      method: fd.get('method'),
      n_seats: parseInt(fd.get('n_seats') as string),
      n_voters: parseInt(fd.get('n_voters') as string),
    });
  });
}
