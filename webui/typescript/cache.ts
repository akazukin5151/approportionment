import { CacheWithParty } from "./types"

export let party_changed = false

/** This caches the processed results, after every election result has been
 * mapped to a color based on the colormap.
 * Always used here and also externally
 **/
export let cache: CacheWithParty | null = null

export function set_cache(new_cache: CacheWithParty | null): void {
  cache = new_cache
}

export function set_party_changed(b: boolean): void {
  party_changed = b
}
