/** Shared global mutable state. These are used instead of passing things around
 * or encapsulating get/set with a class, because it is used in a lot of places
 * and places with a deep call stack. That means many functions will have to
 * pass it around, making it impractical and does not increase maintainability
 * much. As Javascript is single-threaded, data races cannot happen.
 *
 * Just put all shared global mutable variables in this file,
 * so at least they are easy to find.
 * **/

import { PartyManager } from "./party"
import { BarChart } from "./bar_chart"
import { AppCache } from "./types/cache"

/** Whether the cmap should be reversed **/
export let reverse_cmap = false

export function set_reverse_cmap(n: boolean): void {
  reverse_cmap = n
}

/** The canvas element containing the colorwheel; it is plotted in the start without
 * being added to DOM, so that it can be immediately shown when needed **/
export const preplot_canvases: Map<string, HTMLCanvasElement> = new Map()

export function add_preplot_canvas(name: string, c: HTMLCanvasElement): void {
  preplot_canvases.set(name, c)
}

export const party_manager = new PartyManager()

export const party_bar_chart = new BarChart('party-bar-chart')

export const coalition_bar_chart = new BarChart('coalition-bar-chart')

/** This caches the processed results, after every election result has been
 * mapped to a color based on the colormap.
 * Always used here and also externally
 **/
export let cache: AppCache | null = null

export function set_cache(new_cache: AppCache | null): void {
  cache = new_cache
}