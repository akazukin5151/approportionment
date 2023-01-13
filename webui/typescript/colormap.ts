import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { rgb } from 'd3-color';
import { Rgb } from './types';

export class Colormap {
  private readonly is_continuous: boolean
  private readonly scheme: Array<string> | ((t: number) => string)

  constructor() {
    const selector = document.getElementById('cmap_select')!
    const discrete = selector.children[0]!
    let selected = Array.from(discrete.children)
      .find(opt => (opt as HTMLOptionElement).selected)

    if (selected) {
      const name = (selected as HTMLOptionElement).value
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.scheme = d3_scale_chromatic[`scheme${name}`]
      this.is_continuous = false
    } else {
      const continuous = selector.children[1]!
      selected = Array.from(continuous.children)
        .find(opt => (opt as HTMLOptionElement).selected)

      const name = (selected as HTMLOptionElement).value
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.scheme = d3_scale_chromatic[`interpolate${name}`]
      this.is_continuous = true
    }
  }

  map(seats: number, total_seats: number): Rgb {
    if (this.is_continuous) {
      const f = this.scheme as ((t: number) => string)
      return rgb(f(seats / total_seats))
    } else {
      const s = this.scheme as Array<string>
      return rgb(s[seats % s.length]!)
    }
  }

}
