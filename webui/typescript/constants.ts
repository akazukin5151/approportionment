import { grid_x_to_pct, grid_y_to_pct } from "./utils";

/** Radius as a percentage of the canvas **/
export const RADIUS = 0.03

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

