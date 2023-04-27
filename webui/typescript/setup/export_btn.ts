import { cache, party_manager } from "../cache";
import { get_colorize_by, get_method, get_strategy } from "../form";
import { AppCache, Save } from "../types/cache";

export function setup_export_button(): void {
  const btn = document.getElementById('export-btn')!;
  btn.addEventListener('click', () => {
    if (!cache) {
      return
    }
    const save = create_save(cache)
    const j = JSON.stringify(save)
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(j)
    const a = document.createElement('a');
    a.setAttribute("href", str);
    a.setAttribute("download", "simulation_result.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
}

function create_save(cache: AppCache): Save {
  const cmap_btn = document.getElementById('cmap_select_btn')!
  const reverse = document.getElementById('reverse-cmap') as HTMLInputElement
  const contrast = document.getElementById('expand-points') as HTMLInputElement

  const form = document.getElementById("myform") as HTMLFormElement
  const fd = new FormData(form)
  const method = get_method(form)

  // TODO: ideally this will no longer be in the cache
  cache.parties = party_manager.parties

  return {
    result_cache: cache,
    coalitions: party_manager.coalitions.serialize(),
    colorscheme: cmap_btn.innerText,
    reverse_colorscheme: reverse.checked,
    party_to_colorize: get_colorize_by(),
    increase_contrast: contrast.checked,
    method,
    strategy: get_strategy(form),
    n_seats: parseInt(fd.get('n_seats') as string),
    n_voters: parseInt(fd.get('n_voters') as string),
    stdev: parseFloat(fd.get('stdev') as string),
    seed: parseInt(fd.get('seed') as string),
  }
}

