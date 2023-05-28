import { PartyManager } from '../party'
import { plot_parties } from '../plot/party/plot_party'
import { AllCanvases } from '../types/canvas'
import { party_bar_chart, party_manager } from '../cache';
import { colorize_by_handler } from '../coalition_table/coalition_table';
import { Party } from '../types/election';
import { create_chart_dot } from '../td';

export function add_party(
  pm: PartyManager,
  x: number,
  y: number,
  color: string,
  num: number,
  all_canvases: AllCanvases,
  coalition_num: number | null,
  set_colorize_by: boolean
): void {
  const party = pm.add(x, y, color, num)
  plot_parties(all_canvases.party, pm.parties)
  add_to_coalition_table(
    party, coalition_num, all_canvases, set_colorize_by
  )
  party_bar_chart.add_bar(party.color, () => create_chart_dot(party.color))
}

function add_to_coalition_table(
  party: Party,
  coalition_num: number | null,
  all_canvases: AllCanvases,
  set_colorize_by: boolean
): void {
  const table = document.getElementById('coalition-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!

  party_manager.coalitions.add(party.num, coalition_num)
  const tr = (coalition_num != null)
    ? tbody.children[coalition_num - 1]!
    : tbody.lastElementChild!
  const td = tr.children[1]!
  const container = td.children[0]!

  const party_dot = document.createElement('div')
  party_dot.classList.add('party-dot')
  party_dot.style.backgroundColor = party.color
  party_dot.id = `party-dot-${party.num.toString()}`
  if (set_colorize_by) {
    party_dot.classList.add('colorize-by')
  }
  party_dot.draggable = true
  party_dot.addEventListener(
    'dragstart',
    ev => {
      const t = ev.dataTransfer!
      t.dropEffect = "move";
      t.setData("text/plain", (ev.target as HTMLElement).id)
    }
  )
  party_dot.addEventListener(
    'click', e => colorize_by_handler(e, all_canvases, [party.num])
  )
  container.appendChild(party_dot)
}

