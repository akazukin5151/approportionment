import { remove_all_children } from "./dom";
import { array_sum } from "./std_lib";
import { create_text_td } from "./td";
import { AppCache } from "./types/cache";
import { Party } from "./types/election";

export class BarChart {
  // tbody
  private chart = document.getElementById('bar-chart')!.children[0]!
  private bars: Array<HTMLDivElement> = []

  add_party_bar(party: Party): void {
    const row = document.createElement('tr')

    row.appendChild(create_text_td(party.num))

    const bar_td = document.createElement('td')
    const bar = document.createElement('div')
    bar.style.backgroundColor = party.color
    bar.style.height = '10px'
    bar_td.appendChild(bar)
    row.appendChild(bar_td)

    this.chart.appendChild(row)
    this.bars.push(bar)
  }

  plot(seats_for_point: Array<number>): void {
    this.bars.forEach((div, idx) => {
      const seats = seats_for_point[idx]! / array_sum(seats_for_point)
      div.style.width = `${seats * 100}px`
    })
  }

  plot_middle(cache: AppCache): void {
    const c = cache.cache
    // half of 200 * 200
    const middle = 20000
    this.plot(c[middle - 1]!.seats_by_party)
  }

  clear(): void {
    remove_all_children(this.chart)
    this.bars = []
  }
}

