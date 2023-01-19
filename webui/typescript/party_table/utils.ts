import { cache } from '../cache'
import { clear_canvas } from '../canvas'
import { plot_parties_on_circumference } from '../color_wheel/plot_parties'
import { load_parties } from '../form'
import { plot_party_with_listeners } from '../plot/party/plot_party'
import { Canvas } from '../types'

export function on_color_picker_change(
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

  plot_party_with_listeners(canvas, parties)

  if (cache) {
    cache.parties = parties
    const max_radius = 70
    const party_canvas =
      document.getElementById('color-wheel-party') as HTMLCanvasElement
    const origin = party_canvas.width / 2
    const party_ctx = party_canvas.getContext('2d')!
    clear_canvas(party_ctx)
    plot_parties_on_circumference(party_ctx, cache, max_radius, origin)
  }
}

export function find_next_party_num(tbody: HTMLTableSectionElement): number {
  const party_numbers = Array.from(tbody.children)
    .filter((_, idx) => idx !== 0)
    .map(row => {
      const td = row.children[1] as HTMLElement
      return parseInt(td.innerText)
    })
  // Ensure there is at least one item in the array
  // The only item will be a 0 in that case
  party_numbers.push(-1)
  const max_party_num = Math.max(...party_numbers)
  return max_party_num + 1
}
