import * as PIXI from 'pixi.js'
import { DEFAULT_PARTIES } from './constants';
import { x_scale, y_scale } from './utils';
import { plot_party_core } from './plot_party'
import { generic_new_row } from './create_party_table'
import { random_between, random_color, round_1dp } from './random';

export function setup_party_table(stage: PIXI.Container): void {
  const table = document.getElementById('party-table')
  if (!table) { return }
  const tbody = table.getElementsByTagName("tbody")[0]!;

  add_default_parties(stage, tbody);

  const btn = document.getElementById('add-party-button')
  btn?.addEventListener("click", () => {
    const color = random_color()
    const x = round_1dp(random_between(-1, 1))
    const y = round_1dp(random_between(-1, 1))

    const next_party_num = generic_new_row(stage, tbody, false, color, x, y)

    const parties = [{
      x: x_scale(x),
      y: y_scale(y),
      color,
      num: next_party_num
    }]
    plot_party_core(stage, parties)
  })
}

function add_default_parties(
  stage: PIXI.Container,
  tbody: HTMLTableSectionElement
): void {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(stage, tbody, idx === 2, party.color, party.x, party.y)
  })
}

