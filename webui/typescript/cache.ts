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

/** A flag to indicate if certain party settings has changed,
 * such as dragging a party or deleting them.
 * If it was changed, then the seat and coalition columns will no longer update
 * on hover, as the plot no longer reflects the new settings. */
export let party_changed = false

export function set_party_changed(b: boolean): void {
  party_changed = b
}

/** This caches the processed results, after every election result has been
 * mapped to a color based on the colormap.
 * Always used here and also externally
 **/
export let cache: AppCache | null = null

export function set_cache(new_cache: AppCache | null): void {
  cache = new_cache
}
