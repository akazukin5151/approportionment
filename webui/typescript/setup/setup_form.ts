import { load_parties } from '../load_parties';

export function setup_form_handler(
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

    const parties = load_parties()
      .map(p => ({x: p.grid_x, y: p.grid_y, num: null, color: null}))

    worker.postMessage({
      parties,
      method: fd.get('method'),
      n_seats: parseInt(fd.get('n_seats') as string),
      n_voters: parseInt(fd.get('n_voters') as string),
    });
  });
}
