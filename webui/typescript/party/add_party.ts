import { PartyManager } from '../party'
import { plot_parties } from '../plot/party/plot_party'
import { AllCanvases, Canvas } from '../types/canvas'
import { party_bar_chart, party_manager } from '../cache';
import { random_between, random_color, round_1dp } from '../random';
import { colorize_by_handler } from '../coalition_table/coalition_table';
import { Party } from '../types/election';
import { clear_legend_highlight } from '../td';

export function setup_add_party(all_canvases: AllCanvases): void {
  const btn = document.getElementById('add-party-button')!
  btn.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))
    const num = party_manager.next_party_num()
    add_party(party_manager, x, y, color, num, all_canvases, null, false)
    // TODO: copied
    // TODO: clear bar graph as well
    clear_legend_highlight()
    party_manager.party_changed = true
  })
}

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
    party, coalition_num, all_canvases.simulation, set_colorize_by
  )
  party_bar_chart.add_bar(party.num, party.color)
}

function add_to_coalition_table(
  party: Party,
  coalition_num: number | null,
  simulation_canvas: Canvas,
  set_colorize_by: boolean
): void {
  const table = document.getElementById('coalition-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!

  let tr
  if (coalition_num != null) {
    const coalitions =
      party_manager.coalitions.find(
        coalition => coalition.coalition_num === coalition_num
      )
    if (coalitions) {
      coalitions.parties.push(party.num)
    } else {
      party_manager.coalitions.push({
        coalition_num: coalition_num,
        parties: [party.num]
      })
    }
    tr = tbody.children[coalition_num - 1]!
  } else {
    tr = tbody.lastElementChild!
  }
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
  party_dot.addEventListener('click', e => colorize_by_handler(e, simulation_canvas))
  container.appendChild(party_dot)
}

