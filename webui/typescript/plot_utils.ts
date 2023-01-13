import { cache, set_cache } from "./cache"
import { clear_canvas, plot_colors_to_canvas } from "./canvas"
import { load_parties } from "./load_parties"
import { Colormap } from "./colormap"
import { array_sum, parties_equals } from "./std_lib"
import { Canvas, SimulationPoint, SimulationResult } from "./types"

export function replot(simulation_canvas: Canvas): void {
  const parties = load_parties()
  if (cache && parties_equals(cache.parties, parties)) {
    const new_cache = cache.cache.map(parse_result)
    set_cache({ cache: new_cache, parties })
    clear_canvas(simulation_canvas)
    plot_colors_to_canvas(simulation_canvas, 0, new_cache.map(p => p.color))
  }
}

export function parse_result(
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

