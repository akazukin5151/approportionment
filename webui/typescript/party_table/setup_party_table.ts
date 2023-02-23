import { DEFAULT_PARTIES } from '../defaults';
import { plot_party_with_listeners } from '../plot/party/plot_party'
import { generic_new_row } from './create_party_table'
import { random_between, random_color, round_1dp } from '../random';
import { load_parties , add_to_colorize_by } from '../form';
import { AllCanvases } from '../types/canvas';
import { find_next_party_num } from './utils';

export function setup_party_table(all_canvases: AllCanvases): void {
  const table = document.getElementById('party-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  add_default_parties(all_canvases, tbody);

  const btn = document.getElementById('add-party-button')
  btn?.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))
    const num = find_next_party_num(tbody)

    generic_new_row(all_canvases, tbody, color, x, y, num)
    const parties = load_parties()

    plot_party_with_listeners(all_canvases, parties)
    add_to_colorize_by('Party', num)
  })
}

function add_default_parties(
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement
): void {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(
      all_canvases, tbody, party.color,
      party.grid_x, party.grid_y, idx
    )
  })
}

