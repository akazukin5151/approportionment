import { cache } from "../cache";
import { parties_from_table } from "../form";
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

  const form = document.getElementById("myform") as HTMLFormElement
  const fd = new FormData(form)

  return {
    result_cache: cache,
    coalitions: get_coalitions(),
    colorscheme: cmap_btn.innerText,
    party_to_colorize: colorize_select.value,
    method: fd.get('method') as string,
    n_seats: parseInt(fd.get('n_seats') as string),
    n_voters: parseInt(fd.get('n_voters') as string),
    stdev: parseFloat(fd.get('stdev') as string),
  }
}

function get_coalitions(): Array<Coalition> {
  const coalitions: Map<number, Array<number>> = new Map()
  parties_from_table().forEach(tr => {
    const party_num = parseInt((tr.children[0] as HTMLElement).innerText)
    const select = tr.children[5]!.children[0] as HTMLInputElement
    const coalition_num = parseInt(select.value)
    const parties = coalitions.get(coalition_num)
    if (parties) {
      parties.push(party_num)
    } else {
      coalitions.set(coalition_num, [party_num])
    }
  })
  return Array.from(coalitions)
    .map(([coalition_num, parties]) => ({ coalition_num, parties }))
}

