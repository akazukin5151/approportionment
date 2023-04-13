import { add_to_colorize_by } from '../form'
import { PartyManager } from '../party'
import { plot_parties } from '../plot/party/plot_party'
import { AllCanvases } from '../types/canvas'
import { party_manager } from '../cache';
import { random_between, random_color, round_1dp } from '../random';
import { colorize_by_handler } from '../coalition_table/coalition_table';

export function setup_add_party(all_canvases: AllCanvases): void {
  const btn = document.getElementById('add-party-button')!
  btn.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))
    const num = party_manager.next_party_num()
    add_party(party_manager, x, y, color, num, all_canvases, null)
  })
}

export function add_party(
  pm: PartyManager,
  x: number,
  y: number,
  color: string,
  num: number,
  all_canvases: AllCanvases,
  coalition_num: number | null
): void {
  pm.add(x, y, color, num)
  plot_parties(all_canvases.party, pm.parties)
  add_to_colorize_by('Party', num)
  add_to_coalition_table(num, color, coalition_num)
}

function add_to_coalition_table(
  num: number,
  color: string,
  coalition_num: number | null
): void {
  const table = document.getElementById('coalition-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!

  const tr = (coalition_num != null)
    ? tbody.children[coalition_num - 1]!
    : tbody.lastElementChild!
  const td = tr.children[1]!
  const container = td.children[0]!

  const party_dot = document.createElement('div')
  party_dot.classList.add('party-dot')
  party_dot.style.backgroundColor = color
  party_dot.id = `party-dot-${num.toString()}`
  party_dot.draggable = true
  party_dot.addEventListener(
    'dragstart',
    ev => {
      const t = ev.dataTransfer!
      t.dropEffect = "move";
      t.setData("text/plain", (ev.target as HTMLElement).id)
    }
  )
  party_dot.addEventListener('click', colorize_by_handler)
  container.appendChild(party_dot)
}

