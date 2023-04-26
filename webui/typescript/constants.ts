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

export const CANDIDATE_BASED_METHODS = [
  'StvAustralia', 'SpavMean', 'SpavMedian', 'RrvNormed', 'RrvBullet',
  'StarPrNormed', 'SssNormed'
]

