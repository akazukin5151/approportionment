import { DEFAULT_PARTIES } from '../constants';
import { plot_party_with_listeners } from '../plot/party/plot_party'
import { generic_new_row } from './create_party_table'
import { random_between, random_color, round_1dp } from '../random';
import { load_parties } from '../form';
import { AllCanvases } from '../types/app';

export function setup_party_table(all_canvases: AllCanvases): void {
  const table = document.getElementById('party-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  add_default_parties(all_canvases, tbody);

  const btn = document.getElementById('add-party-button')
  btn?.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))

    generic_new_row(all_canvases, tbody, false, color, x, y)
    const parties = load_parties()

    plot_party_with_listeners(all_canvases, parties)
  })
}

function add_default_parties(
  all_canvases: AllCanvases,
  tbody: HTMLTableSectionElement
): void {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(
      all_canvases, tbody, idx === 2, party.color,
      party.grid_x, party.grid_y
    )
  })
}

