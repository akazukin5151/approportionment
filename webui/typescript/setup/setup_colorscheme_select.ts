import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { rgb } from 'd3-color';
import { CONTINUOUS_CMAPS, DISCRETE_CMAPS } from '../cmaps';
import { Canvas, Rgb } from '../types';
import { replot } from '../utils';

export function setup_cmaps(simulation_canvas: Canvas): void {
  const select = document.getElementById('cmap_select')!
  const discrete_group = setup_optgroup(DISCRETE_CMAPS)
  discrete_group.label = 'Discrete'
  select.appendChild(discrete_group)

  const continuous_group = setup_optgroup(CONTINUOUS_CMAPS)
  continuous_group.label = 'Continuous'
  select.appendChild(continuous_group)

  select.onchange = () => replot(simulation_canvas)
}

function setup_optgroup(cmap: Array<string>): HTMLOptGroupElement {
  const optgroup = document.createElement('optgroup')
  cmap.forEach(cmap => {
    const option = document.createElement('option')
    option.value = cmap
    option.innerText = cmap
    // our default cmap
    if (cmap === 'Category10') {
      option.selected = true
    }
    optgroup.appendChild(option)
  })
  return optgroup
}

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
