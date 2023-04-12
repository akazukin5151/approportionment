import { cache, party_manager } from "../cache";
import { get_radio } from "../form";
import { AppCache, Coalition, Save } from "../types/cache";

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
  const colorize_select = document.getElementById('colorize-by') as HTMLInputElement
  const reverse = document.getElementById('reverse-cmap') as HTMLInputElement
  const contrast = document.getElementById('expand-points') as HTMLInputElement

  const form = document.getElementById("myform") as HTMLFormElement
  const fd = new FormData(form)
  const radio_group = form.elements.namedItem('method') as RadioNodeList
  const method = get_radio(radio_group)!

  // TODO: ideally this will no longer be in the cache
  cache.parties = party_manager.parties

  return {
    result_cache: cache,
    coalitions: get_coalitions(),
    colorscheme: cmap_btn.innerText,
    reverse_colorscheme: reverse.checked,
    party_to_colorize: colorize_select.value,
    increase_contrast: contrast.checked,
    method,
    n_seats: parseInt(fd.get('n_seats') as string),
    n_voters: parseInt(fd.get('n_voters') as string),
    stdev: parseFloat(fd.get('stdev') as string),
    seed: parseInt(fd.get('seed') as string),
  }
}

function get_coalitions(): Array<Coalition> {
  const coalitions: Map<number, Array<number>> = new Map()
  party_manager.parties.forEach(party => {
    // TODO: add coalition field to Party, which will remove the need
    // for this function
    //
    // const select = tr.children[5]!.children[0] as HTMLInputElement
    // const coalition_num = parseInt(select.value)
    // const parties = coalitions.get(coalition_num)
    // if (parties) {
    //   parties.push(party.num)
    // } else {
    //   coalitions.set(coalition_num, [party.num])
    // }
  })
  return Array.from(coalitions)
    .map(([coalition_num, parties]) => ({ coalition_num, parties }))
}

