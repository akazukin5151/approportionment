import { Save } from "../types/cache";
import { AllCanvases } from '../types/canvas';
import { import_json } from '../import';

export function plot_default_result(all_canvases: AllCanvases): void {
  fetch('./square.json')
    .then((response) => response.json())
    .then((cache: Save) => {
      // we force the initial n_voters to 100, even though the default
      // uses 1000 voters, because 100 voters is faster. 1000 is used to
      // make the initial plot look better
      cache.n_voters = 100
      import_json(all_canvases, cache)
    })
}
