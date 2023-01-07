import * as PIXI from 'pixi.js'
import { DEFAULT_PARTIES } from './constants';
import { x_scale, y_scale } from './utils';
import { plot_party_core } from './plot_party'
import { generic_new_row } from './create_party_table'

function random_between(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function round_1dp(n: number) {
  return Math.round(n * 10) / 10
}

function random_color(): number {
  return Math.round(random_between(0, 0xffffff))
}

export function setup_party_table(stage: PIXI.Container) {
  const table = document.getElementById('party_table')
  if (!table) { return }
  const tbody = table.getElementsByTagName("tbody")[0];

  add_default_parties(stage, tbody);

  const btn = document.getElementById('add_party_button')
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
) {
  DEFAULT_PARTIES.forEach((party, idx) => {
    generic_new_row(stage, tbody, idx === 2, party.color, party.x, party.y)
  })
}

