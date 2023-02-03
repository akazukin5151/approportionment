/* eslint-disable no-magic-numbers */

import * as d3 from "d3-color"

// colors from:
// https://github.com/kwstat/pals/blob/main/R/colors_discrete.R

const POLYCHROME = [
  "#5A5156", "#E4E1E3", "#F6222E", "#FE00FA", "#16FF32",
  "#3283FE", "#FEAF16", "#B00068", "#1CFFCE", "#90AD1C", "#2ED9FF",
  "#DEA0FD", "#AA0DFE", "#F8A19F", "#325A9B", "#C4451C", "#1C8356",
  "#85660D", "#B10DA1", "#FBE426", "#1CBE4F", "#FA0087", "#FC1CBF",
  "#F7E1A0", "#C075A6", "#782AB6", "#AAF400", "#BDCDFF", "#822E1C",
  "#B5EFB5", "#7ED7D1", "#1C7F93", "#D85FF7", "#683B79", "#66B0FF",
  "#3B00FB"
]

const ALPHABET = [
  "#F0A0FF", "#0075DC", "#993F00", "#4C005C", "#191919", "#005C31",
  "#2BCE48", "#FFCC99", "#808080", "#94FFB5", "#8F7C00", "#9DCC00",
  "#C20088", "#003380", "#FFA405", "#FFA8BB", "#426600", "#FF0010",
  "#5EF1F2", "#00998F", "#E0FF66", "#740AFF", "#990000", "#FFFF80",
  "#FFE100", "#FF5005"
]

const KELLY_RGB = [
  [242, 243, 244],
  [34, 34, 34],
  [243, 195, 0],
  [135, 86, 146],
  [243, 132, 0],
  [161, 202, 241],
  [190, 0, 50],
  [194, 178, 128],
  [132, 132, 130],
  [0, 136, 86],
  [230, 143, 172],
  [0, 103, 165],
  [249, 147, 121],
  [96, 78, 151],
  [246, 166, 0],
  [179, 68, 108],
  [220, 211, 0],
  [136, 45, 23],
  [141, 182, 0],
  [101, 69, 34],
  [226, 88, 34],
  [43, 61, 38],
]

const KELLY = KELLY_RGB.map(x => d3.rgb(x[0]!, x[1]!, x[2]!))

export const PERMUTATION_COLORS: { [key: string]: Array<d3.RGBColor> } = {
  Alphabet: ALPHABET.map(x => d3.rgb(x)),
  Polychrome: POLYCHROME.map(x => d3.rgb(x)),
  Kelly: KELLY
}
