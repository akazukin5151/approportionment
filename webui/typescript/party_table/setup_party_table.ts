import { DEFAULT_PARTIES } from '../constants';
import { plot_party_with_listeners } from '../plot/party/plot_party'
import { generic_new_row } from './create_party_table'
import { random_between, random_color, round_1dp } from '../random';
import { load_parties } from '../load_parties';
import { Canvas } from '../types';

export function setup_party_table(canvas: Canvas): void {
  const table = document.getElementById('party-table')!
  const tbody = table.getElementsByTagName("tbody")[0]!;

  add_default_parties(canvas, tbody);

  const btn = document.getElementById('add-party-button')
  btn?.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))

    generic_new_row(canvas, tbody, false, color, x, y)
    const parties = load_parties()

    plot_party_with_listeners(canvas, parties)
  })
}

function add_default_parties(
  canvas: Canvas,
  tbody: HTMLTableSectionElement
): void {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(
      canvas, tbody, idx === 2, party.color, party.grid_x, party.grid_y
    )
  })
}

