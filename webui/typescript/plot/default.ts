import { AppCache } from "../types/cache";
import { AllCanvases } from '../types/canvas';
import { import_json } from '../import';

export function plot_default_result(all_canvases: AllCanvases): void {
  fetch('./default_simulation_result.json')
    .then((response) => response.json())
    .then((cache: AppCache) => {
      import_json(all_canvases, cache)
    })
}
