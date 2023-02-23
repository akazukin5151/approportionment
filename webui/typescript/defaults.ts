import { grid_x_to_pct, grid_y_to_pct } from "./convert_locations";

// Note that if this is changed, the default_simulation_result.json file needs
// to be updated
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
    color: '#FF9800',
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
    color: '#2196F3',
    num: 3
  },

]

/** Default coalitions. Format isn't anything uniquely used for coalitions
 * Outer array is list of coalitions (2 coalitions here).
 * Inner array is list of party nums. */
export const DEFAULT_COALITIONS = [[0, 1], [2, 3]]
