import { map_to_hsluv, map_to_lch, map_to_okhsl } from "../blended_cmaps/colors"
import { GridCoords } from "../types/position"

/**
 * From https://observablehq.com/@d3/color-schemes
 * Download the code and you can see that the colors are hardcoded
 */
export const CONTINUOUS_CMAPS = [
  "Blues",
  "Greens",
  "Greys",
  "Oranges",
  "Purples",
  "Reds",
  "BuGn",
  "BuPu",
  "GnBu",
  "OrRd",
  "PuBuGn",
  "PuBu",
  "PuRd",
  "RdPu",
  "YlGnBu",
  "YlGn",
  "YlOrBr",
  "YlOrRd",
  "Cividis",
  "Viridis",
  "Inferno",
  "Magma",
  "Plasma",
  "Warm",
  "Cool",
  "CubehelixDefault",
  "Turbo",
  "BrBG",
  "PRGn",
  "PiYG",
  "PuOr",
  "RdBu",
  "RdGy",
  "RdYlBu",
  "RdYlGn",
  "Spectral",
  "Rainbow",
  "Sinebow",

]

export const DISCRETE_CMAPS = [
  "Category10",
  "Accent",
  "Dark2",
  "Paired",
  "Pastel1",
  "Pastel2",
  "Set1",
  "Set2",
  "Set3",
  "Tableau10",
]

export const BLENDED_CMAPS = ["ColormapND", "OkHSL", "HSLuv"]

export const PERMUTATION_CMAPS = ["Kelly", "Polychrome", "Alphabet"]

export function get_blended_fun(name: string): (points: Array<GridCoords>) => Array<d3.RGBColor> {
  if (name === BLENDED_CMAPS[0]) {
    return map_to_lch
  } else if (name === BLENDED_CMAPS[1]) {
    return map_to_okhsl
  }
  return map_to_hsluv
}

