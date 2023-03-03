import * as d3 from 'd3-color';
import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { MAX_CHROMA } from '../../constants';
import { PERMUTATION_COLORS } from '../../cmap_names/permutation_cmaps';
import { hcl, hsluv, okhsl } from '../../blended_cmaps/colors';

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
  } else if (name === "HSLuv") {
    return plot_hsluv()
  }
  return plot_okhsl()
}

function plot_blended_abstract(
  initial: number,
  iteration_step: number,
  create_color: (angle: number, outer: number) => d3.RGBColor
): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    const radius_step = 10
    for (let outer = initial; outer > iteration_step; outer -= iteration_step) {
      const colors = []
      const line = document.createElement('div')
      line.className = 'blended-line'
      for (let angle = 0; angle < 360; angle += radius_step) {
        colors.push(create_color(angle, outer).toString())
      }
      const gradient = 'linear-gradient(to right,' + colors.join(',') + ')'
      line.style.backgroundImage = gradient
      container.appendChild(line)
    }
  }
}

function plot_colormap_nd(): (container: HTMLDivElement) => void {
  const chroma_step = 7
  return plot_blended_abstract(MAX_CHROMA, chroma_step, hcl)
}

function plot_okhsl(): (container: HTMLDivElement) => void {
  const max_radius = 100
  const sat_step = 10
  return plot_blended_abstract(max_radius, sat_step, (a, r) => okhsl(a, r, max_radius))
}

function plot_hsluv(): (container: HTMLDivElement) => void {
  const sat_step = 10
  return plot_blended_abstract(100, sat_step, hsluv)
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

