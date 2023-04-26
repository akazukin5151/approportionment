export const CANVAS_SIDE = 200

export const CANVAS_SIDE_SQUARED = 40000

export const ORIGIN = CANVAS_SIDE / 2

/** Arbitrary size larger than CANVAS_SIDE so that canvas won't be blurry
 * CSS scales the actual size according to screen width. */
export const PARTY_CANVAS_SIZE = 500

export const TAU = 2 * Math.PI

/* The max chroma is also equal to the max radius of the color wheel.
 * Each ring with radius r corresponds to a chroma value of r */
export const MAX_CHROMA = 70

export const LIGHTNESS = 55

export const PARTY_RADIUS = 13

// these can't include normed or bullet, as they are vote strategies
// we match on the method name only; we only combine method and strategy names
// when submitting to the wasm worker

export const CANDIDATE_BASED_METHODS = [
  'StvAustralia', 'Spav', 'Rrv', 'StarPr', 'Sss'
]

export const APPROVAL_METHODS = [ 'Spav' ]

export const SCORE_METHODS = [
  'Rrv', 'StarPr', 'Sss'
]
