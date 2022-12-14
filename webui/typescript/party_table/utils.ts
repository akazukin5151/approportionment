import * as PIXI from 'pixi.js'
import { plot_single_party } from '../plot/plot_party'
import { InfoGraphics } from '../types'
import { color_str_to_num } from '../utils'

export function delete_party(stage: PIXI.Container, ev: MouseEvent): void {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num_td = tr.children[1] as HTMLElement
    const party_num = num_td.innerText
    const elems = stage.children;
    Array.from(elems).forEach(e => {
      if (e instanceof InfoGraphics && e.num === parseInt(party_num)) {
        e.destroy()
      }
    })
    reselect_radio(tr)
    tr.remove()
  }
}

// Reselect the radio if the party to delete has a checked radio
function reselect_radio(parent: Element): void {
  const radio_td = parent.children[0]
  const radio = radio_td?.children[0] as HTMLInputElement
  if (!radio.checked) {
    return
  }
  const prev_row = parent.previousSibling as Element | null
  const prev_row_children = prev_row?.children
  if (prev_row_children) {
    return set_radio_from_row(prev_row_children)
  }
  // otherwise, try the next sibling
  const next_row = parent.nextSibling as Element | null
  const next_row_children = next_row?.children
  if (next_row_children) {
    set_radio_from_row(next_row_children)
  }
}

function set_radio_from_row(row: HTMLCollection): void {
  const radio = row[0]!.children[0]
  if (radio) {
    (radio as HTMLInputElement).checked = true
  }
}

export function update_color_picker(
  stage: PIXI.Container,
  party_num: number,
  evt: Event
): void {
  const target = evt.target as HTMLInputElement
  if (!target.value) {
    return
  }

  const party = stage.children
    .filter(c => c instanceof InfoGraphics)
    .find(c => (c as InfoGraphics).num === party_num) as InfoGraphics | null

  if (!party) {
    return
  }
  const color = color_str_to_num(target.value)
  plot_single_party(stage, party.num, color, party.x, party.y)
  party.destroy()
}
