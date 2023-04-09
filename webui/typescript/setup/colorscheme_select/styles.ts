/** Functions to enable/disable settings based on currently selected colorscheme */
import {
  BLENDED_CMAPS,
  CONTINUOUS_CMAPS,
  DISCRETE_CMAPS,
} from '../../cmap_names/cmap_names';

function abstract_style(
  label_id: string,
  input_id: string,
  enable_cond: () => boolean,
): void {
  const label = document.getElementById(label_id)!
  const container = label.parentElement!
  const input = document.getElementById(input_id) as HTMLInputElement

  if (enable_cond()) {
    container.classList.remove('discouraged-color')
    input.disabled = false
  } else {
    label.classList.add('not-allowed-cursor')
    container.classList.add('discouraged-color')
    input.disabled = true
  }
}


export function style_contrast(color: string): void {
  return abstract_style(
    'expand-points-label',
    'expand-points',
    () => BLENDED_CMAPS.includes(color)
  )
}

export function style_colorize_by(color: string): void {
  return abstract_style(
    'colorize-by-label',
    'colorize-by',
    () => DISCRETE_CMAPS.includes(color) || CONTINUOUS_CMAPS.includes(color)
  )
}

export function style_reverse_cmap(color: string): void {
  return abstract_style(
    'reverse-cmap-label',
    'reverse-cmap',
    () => DISCRETE_CMAPS.includes(color) || CONTINUOUS_CMAPS.includes(color)
  )
}

