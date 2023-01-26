import * as d3 from 'd3-color';
import * as d3_scale_chromatic from 'd3-scale-chromatic'
import { LIGHTNESS, MAX_CHROMA } from '../../constants';

export function plot_discrete(name: string): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    container.style.display = 'flex'
    container.style.justifyContent = 'stretch'
    container.style.alignItems = 'center'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const cmap: Array<d3.RGBColor> = d3_scale_chromatic[`scheme${name}`]
    cmap.forEach(color => {
      const square = document.createElement('div')
      square.style.width = '20px'
      square.style.height = '20px'
      square.style.backgroundColor = color.toString()
      container.appendChild(square)
    })
  }
}

export function plot_continuous(name: string): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const cmap = d3_scale_chromatic[`interpolate${name}`]
    const colors = []
    for (let i = 0; i < 100; i++) {
      const color = cmap(i / 100)
      colors.push(color)
    }
    const gradient = 'linear-gradient(to right,' + colors.join(',') + ')'
    container.style.backgroundImage = gradient
  }
}

export function plot_blended(_: string): (container: HTMLDivElement) => void {
  return (container: HTMLDivElement) => {
    // FIXME: broken. use preplotted wheel?
    const colors = []
    const chroma_step = 20
    for (let chroma = chroma_step; chroma < MAX_CHROMA; chroma += chroma_step) {
      const line = document.createElement('div')
      line.style.width = '150px'
      line.style.height = '5px'
      for (let h = 0; h < 360; h++) {
        const color = d3.hcl(h, chroma, LIGHTNESS);
        colors.push(color.rgb().clamp())
      }
      const gradient = 'linear-gradient(to right,' + colors.join(',') + ')'
      line.style.backgroundImage = gradient
      container.appendChild(line)
    }
  }
}

