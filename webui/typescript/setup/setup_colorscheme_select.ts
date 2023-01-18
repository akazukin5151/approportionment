import { COLORMAP_ND, CONTINUOUS_CMAPS, DISCRETE_CMAPS } from '../cmaps';
import { Canvas } from '../types';
import { replot } from '../plot/replot';

export function setup_cmaps(simulation_canvas: Canvas): void {
  const select = document.getElementById('cmap_select')!
  const discrete_group = setup_optgroup(DISCRETE_CMAPS)
  discrete_group.label = 'Discrete'
  select.appendChild(discrete_group)

  const continuous_group = setup_optgroup(CONTINUOUS_CMAPS)
  continuous_group.label = 'Continuous'
  select.appendChild(continuous_group)

  const colormap_nd_group = setup_optgroup(COLORMAP_ND)
  colormap_nd_group.label = 'Blended'
  select.appendChild(colormap_nd_group)

  select.onchange = (): void => replot(simulation_canvas)
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

