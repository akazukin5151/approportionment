import { AppCache } from "./types"

/** A flag to indicate if certain party settings has changed,
 * such as dragging a party or deleting them.
 * If it was changed, then the seat and coalition columns will no longer update
 * on hover, as the plot no longer reflects the new settings. */
export let party_changed = false

/** This caches the processed results, after every election result has been
 * mapped to a color based on the colormap.
 * Always used here and also externally
 **/
export let cache: AppCache | null = null

export function set_cache(new_cache: AppCache | null): void {
  cache = new_cache
}

export function set_party_changed(b: boolean): void {
  party_changed = b
}
