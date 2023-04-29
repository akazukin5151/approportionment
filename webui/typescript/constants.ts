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
  'StvAustralia', 'Spav', 'Rrv', 'StarPr', 'Sss'
]

export const APPROVAL_METHODS = [ 'Spav' ]

export const SCORE_METHODS = [
  'Rrv', 'StarPr', 'Sss'
]

export const THIELE_METHODS = ['Spav', 'Rrv']

export const STRATEGIES: { [css_id: string]: string } = {
  approve_mean: 'Mean',
  approve_median: 'Median',
  lerp_norm: 'NormedLinear',
  bullet: 'Bullet',
  no_party_discipline: 'None',
  min_party_discipline: 'Min',
  avg_party_discipline: 'Avg',
}

