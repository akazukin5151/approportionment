import { remove_all_children } from "./dom";
import { array_sum } from "./std_lib";
import { create_text_td } from "./td";
import { AppCache } from "./types/cache";

export class BarChart {
  // tbody
  private chart: Element
  private bars: Array<HTMLDivElement> = []

  constructor(id: string) {
    this.chart = document.getElementById(id)!.children[1]!
  }

  add_bar(num: number, color: string): void {
    const row = document.createElement('tr')

    row.appendChild(create_text_td(num))

    const bar_td = document.createElement('td')
    const bar = document.createElement('div')
    bar.style.backgroundColor = color
    bar.style.height = '10px'
    bar.style.width = '0'
    bar_td.appendChild(bar)
    row.appendChild(bar_td)

    this.chart.appendChild(row)
    this.bars.push(bar)
  }

  delete_bar(num: number): void {
    let idx = 0
    for (const row of this.chart.children) {
      const num_td = row.children[0] as HTMLElement
      const num_ = num_td.innerText
      if (num_ === num.toString()) {
        row.remove()
        break
      }
      idx += 1
    }
    this.bars.splice(idx, 1)
  }

  plot(bar_values: Array<number>): void {
    bar_values.forEach((value, idx) => {
      const seats = value / array_sum(bar_values)
      const div = this.bars[idx]!
      div.style.width = `${seats * 100}px`
    })
  }

  plot_middle(cache: AppCache): void {
    const c = cache.cache
    // half of 200 * 200
    const middle = 20000
    this.plot(c[middle - 1]!.seats_by_party)
  }

  /** Empty the entire table */
  clear(): void {
    remove_all_children(this.chart)
    this.bars = []
  }

  /** Set all seats to zero, but otherwise keep the current rows */
  zero(): void {
    this.bars.forEach(div => {
      div.style.width = '0px'
    })
  }
}

