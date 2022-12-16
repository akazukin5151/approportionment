import * as d3 from 'd3';

export const DEFAULT_PARTIES = [
  { x: -0.7, y: 0.7, color: '#F44336' },
  { x: 0.7, y: 0.7, color: '#2196F3' },
  { x: 0.7, y: -0.7, color: '#4CAF50' },
  { x: -0.7, y: -0.7, color: '#FF9800' },
]

export const box_width = 600
export const box_height = 600

export const x_scale = d3.scaleLinear()
  .domain([-1, 1])
  .range([0, box_width])

export const y_scale = d3.scaleLinear()
  .domain([-1, 1])
  .range([box_height, 0])

