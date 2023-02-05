import * as d3 from 'd3-color'
import { set_cache } from "../cache";
import { plot_colors_to_canvas } from "../canvas";
import { AppCache } from "../types/cache";
import { Canvas } from '../types/canvas';
import { rebuild_legend } from "./replot";

export function plot_default_result(simulation_canvas: Canvas): void {
  fetch('./default_simulation_result.json')
    .then((response) => response.json())
    .then((cache: AppCache) => {
      // technically the cache's type isn't AppCache - cache.legend.colors
      // expects d3.RGBColor to convert for the legend
      // this line converts it into d3.RGBColor
      // every other field are ultimately primitives that does not need to
      // be converted
      cache.legend.colors = cache.legend.colors.map(x => d3.rgb(x.r, x.g, x.b))
      set_cache(cache)
      plot_colors_to_canvas(simulation_canvas, cache.colors)
      rebuild_legend(simulation_canvas, cache, 'Category10')
    })
}
