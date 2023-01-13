import { CacheWithParty } from "./types"

/** This caches the processed results, after every election result has been
 * mapped to a color based on the colormap.
 * Always used here and also externally
 **/
export let cache: CacheWithParty | null = null

export function set_cache(new_cache: CacheWithParty | null) {
  cache = new_cache
}

