import * as PIXI from 'pixi.js'
import { DISCRETE_CMAPS } from '../cmaps';

export function setup_indicator(): void {
  const p = document.getElementById('webgl-status')!
  const text = PIXI.utils.isWebGLSupported()
    ? ' WebGL working'
    : ' No WebGL, using canvas'
  p.innerText = p.innerText + text
}

export function load_cmaps(): void {
  const select = document.getElementById('cmap_select')!
  const discrete_group = populate_optgroup(DISCRETE_CMAPS)
  discrete_group.label = 'Discrete'
  select.appendChild(discrete_group)

  // TODO: continuous cmaps
  //const continuous_group = populate_optgroup(CONTINUOUS_CMAPS)
  //continuous_group.label = 'Continuous'
  //select.appendChild(continuous_group)
}

function populate_optgroup(cmap: Array<string>): HTMLOptGroupElement {
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

