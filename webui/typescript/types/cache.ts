import { ColorizeBy, Rgb } from "./core"
import { Party, SimulationResults } from "./election"
import { GridCoords } from "./position"

/** Avoid naming conflict with built in Cache type **/
export type AppCache = {
  cache: SimulationResults,
  colors: Array<Rgb>,
  // TODO: do we really need to store parties here when we have PartyManager?
  // it's more convenient for updating the colorwheel because otherwise
  // it will have to be passed to cmap select setup, then colorwheel functions
  // so perhaps the solution is to make party manager use AppCache
  // or make PartyManager global as well
  //
  // for now, we use a bit more code to pass PartyManager to plot_simulations
  // but that's better than passing it around cmap select
  parties: Array<Party>,
  legend: Legend
}

/** The "savefile" - data that is exported and imported **/
export type Save = {
  result_cache: AppCache,

  coalitions: Array<CoalitionJSON>,

  colorscheme: string,
  reverse_colorscheme: boolean,
  party_to_colorize: ColorizeBy,
  increase_contrast: boolean,

  method: string,
  n_seats: number,
  n_voters: number,
  stdev: number,
  seed: number,
}

export type CoalitionJSON = {
  coalition_num: number | null,
  parties: Array<number>
}

export type ColorsAndLegend = Pick<AppCache, 'colors' | 'legend'>

export type Legend = {
  quantity: 'Party' | 'Seats',
  // Code for quantity === 'Party' uses the formatRgb() method in d3.RGBColor
  // This won't affect code for quantity === 'Seats', because it only
  // uses the r, g, b properties, which is fully compatible
  colors: Array<Rgb> | Array<d3.RGBColor>,
  radviz: Radviz | null
}

export type Radviz = {
  // these are the coordinates within the unit circle,
  // which encodes the number of seats for all parties for this point
  seat_coords: Array<GridCoords>
  // these are the coordinates of the parties on the circumference of the circle
  party_coords: Array<GridCoords>
}


