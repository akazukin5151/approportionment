import * as d3 from 'd3-color';
import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { Hsluv } from 'hsluv';
import { LIGHTNESS, MAX_CHROMA } from '../../constants';
import { PERMUTATION_COLORS } from '../../cmaps/permutation_cmaps';

export function plot_discrete(
  name: string,
  reverse: boolean
): (container: HTMLDivElement) => void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const cmap: Array<d3.RGBColor> = d3_scale_chromatic[`scheme${name}`]
  return plot_discrete_with_cmap(reverse, cmap)
}

export function plot_continuous(
  name: string,
  reverse: boolean
): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const cmap = d3_scale_chromatic[`interpolate${name}`]
    const colors = []
    for (let i = 0; i < 100; i++) {
      const color = reverse
        ? cmap(1 - i / 100)
        : cmap(i / 100)
      colors.push(color)
    }
    const gradient = 'linear-gradient(to right,' + colors.join(',') + ')'
    container.style.backgroundImage = gradient
  }
}

export function plot_blended(
  name: string,
  _: boolean
): (container: HTMLDivElement) => void {
  if (name === "ColormapND") {
    return plot_colormap_nd()
  }
  return plot_hsluv()
}

function plot_blended_abstract(
  initial: number,
  iteration_step: number,
  create_color: (outer: number, angle: number) => string
): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    const radius_step = 10
    for (let outer = initial; outer > iteration_step; outer -= iteration_step) {
      const colors = []
      const line = document.createElement('div')
      line.className = 'blended-line'
      for (let angle = 0; angle < 360; angle += radius_step) {
        colors.push(create_color(outer, angle))
      }
      const gradient = 'linear-gradient(to right,' + colors.join(',') + ')'
      line.style.backgroundImage = gradient
      container.appendChild(line)
    }
  }
}

function plot_colormap_nd(): (container: HTMLDivElement) => void {
  const chroma_step = 7
  return plot_blended_abstract(
    MAX_CHROMA,
    chroma_step,
    (outer, angle) => d3.hcl(angle, outer, LIGHTNESS).rgb().clamp().toString()
  )
}

function plot_hsluv(): (container: HTMLDivElement) => void {
  const sat_step = 10
  return plot_blended_abstract(
    100,
    sat_step,
    (outer, angle) => {
      const color = new Hsluv()
      color.hsluv_l = 55
      color.hsluv_h = angle
      color.hsluv_s = outer
      color.hsluvToRgb()
      const c = d3.rgb(color.rgb_r * 255, color.rgb_g * 255, color.rgb_b * 255)
      return c.toString()
    }
  )
}

export function plot_permutations(
  name: string,
  reverse: boolean
): (container: HTMLDivElement) => void {
  return plot_discrete_with_cmap(reverse, PERMUTATION_COLORS[name]!)
}

function plot_discrete_with_cmap(
  reverse: boolean,
  cmap: Array<d3.RGBColor>
): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    container.classList.add('cmap_item_discrete_color')
    if (reverse) {
      // copy the array and reverse the copy, leaving the original one in the module
      // unchanged
      cmap = cmap.slice().reverse()
    }
    cmap.forEach(color => {
      const square = document.createElement('div')
      square.style.width = '20px'
      square.style.height = '20px'
      square.style.backgroundColor = color.toString()
      container.appendChild(square)
    })
  }
}

