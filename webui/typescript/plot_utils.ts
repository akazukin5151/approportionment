import { cache, set_cache } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { load_parties } from "./load_parties"
import { Colormap } from "./colormap"
import { array_sum, parties_equals } from "./std_lib"
import { Canvas, SimulationPoint, SimulationResult, SimulationResults } from "./types"
import { calculate_colormap_nd_color } from "./colormap_nd"

export function replot(simulation_canvas: Canvas): void {
  const parties = load_parties()
  if (cache && parties_equals(cache.parties, parties)) {
    const new_cache = calculate_color(cache.cache)
    set_cache({ cache: new_cache, parties })
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, new_cache.map(p => p.color))
  }
}

export function calculate_color(r: SimulationResults): Array<SimulationPoint> {
  // TODO: copied from Colormap
  const selector = document.getElementById('cmap_select')!
  const colormap_nd = selector.children[2]!
  const selected = Array.from(colormap_nd.children)
    .find(opt => (opt as HTMLOptionElement).selected)

  if (selected) {
    const colors = calculate_colormap_nd_color(r.map(x => x.seats_by_party))
    return r.map((x, i) => ({ ...x, color: colors[i]! }))
  } else {
    return r.map(map_seats_to_cmap)
  }
}

/** Map seats_by_party to a D3 colormap **/
function map_seats_to_cmap(
  { x, y, seats_by_party }: SimulationResult
): SimulationPoint {
  const party_to_colorize = get_party_to_colorize();
  const seats_for_party_to_colorize = seats_by_party[party_to_colorize]!;
  const cmap = new Colormap()
  const color = cmap.map(seats_for_party_to_colorize, array_sum(seats_by_party));
  return { x, y, color, seats_by_party };
}

function get_party_to_colorize(): number {
  const radio = document.getElementsByClassName('party_radio');
  const checked = Array.from(radio)
    .map((elem, idx) => ({ elem, idx }))
    .find(({ elem }) => (elem as HTMLInputElement).checked);
  return checked?.idx ?? 2
}

