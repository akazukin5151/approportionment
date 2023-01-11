import { load_parties } from '../load_parties'
import { plot_party_core, ppi } from '../plot/party/plot_party'
import { Canvas } from '../canvas'

export function delete_party(canvas: Canvas, ev: MouseEvent): void {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num_td = tr.children[1] as HTMLElement
    const party_num = parseInt(num_td.innerText)
    const info = ppi.map((x, i) => ({x, i})).find(p => p.x.num === party_num);
    if (info) {
      // plot 0 opacity pixels to the party's boundaries
      canvas.plot_square(info.x, 0)
      canvas.putImageData()
      ppi.splice(info.i, 1)
      reselect_radio(tr)
      tr.remove()
    }
  }
}

/** Reselect the radio if the party to delete has a checked radio **/
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
  canvas: Canvas,
  party_num: number,
  evt: Event
): void {
  const target = evt.target as HTMLInputElement
  if (!target.value) {
    return
  }

  const parties = load_parties()
    .map(p => {
      if (p.num === party_num) {
        return { ...p, color: target.value }
      }
      return p
    })

  plot_party_core(canvas, parties)
}
