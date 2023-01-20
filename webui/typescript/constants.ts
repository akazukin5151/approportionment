import { grid_x_to_pct, grid_y_to_pct } from "./convert_locations";

export const CANVAS_SIDE = 200

export const TAU = 2 * Math.PI

/* The max chroma is also equal to the max radius of the color wheel.
 * Each ring with radius r corresponds to a chroma value of r */
export const MAX_CHROMA = 70

export const LIGHTNESS = 55

export const PARTY_RADIUS = 8

export const DEFAULT_PARTIES = [
  {
    grid_x: -0.7,
    grid_y: 0.7,
    x_pct: grid_x_to_pct(-0.7),
    y_pct: grid_y_to_pct(0.7),
    color: '#F44336',
    num: 0
  },

  {
    grid_x: 0.7,
    grid_y: 0.7,
    x_pct: grid_x_to_pct(0.7),
    y_pct: grid_y_to_pct(0.7),
    color: '#2196F3',
    num: 1
  },

  {
    grid_x: 0.7,
    grid_y: -0.7,
    x_pct: grid_x_to_pct(0.7),
    y_pct: grid_y_to_pct(-0.7),
    color: '#4CAF50',
    num: 2
  },

  {
    grid_x: -0.7,
    grid_y: -0.7,
    x_pct: grid_x_to_pct(-0.7),
    y_pct: grid_y_to_pct(-0.7),
    color: '#FF9800',
    num: 3
  },

]

