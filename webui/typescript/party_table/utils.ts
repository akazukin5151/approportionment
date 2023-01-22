import { cache } from '../cache'
import { plot_party_on_wheel } from '../color_wheel/plot'
import { load_parties } from '../form'
import { plot_party_with_listeners } from '../plot/party/plot_party'
import { AllCanvases } from '../types/app'

export function on_color_picker_change(
  all_canvases: AllCanvases,
  party_num: number,
  evt: Event
): void {
  const target = evt.target as HTMLInputElement
  if (target.value === "") {
    return
  }

  const parties = load_parties()
    .map(p => {
      if (p.num === party_num) {
        return { ...p, color: target.value }
      }
      return p
    })

  plot_party_with_listeners(all_canvases, parties)

  if (cache) {
    cache.parties = parties
    plot_party_on_wheel(cache)
  }
}

export function find_next_party_num(tbody: HTMLTableSectionElement): number {
  const party_numbers = Array.from(tbody.children)
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
