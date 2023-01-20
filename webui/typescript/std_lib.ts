/** Utility functions that should be in a standard library but isn't **/

export function array_sum(xs: Array<number>): number {
  return xs.reduce((acc, x) => acc + x, 0)
}

export function array_max(xs: Array<number>): number {
  return xs.reduce((acc, n) => (n > acc) ? n : acc, 0)
}

export function min_by_col(matrix: Array<Array<number>>): Array<number> {
  return reduce_by_col(matrix, (a, b) => b < a)
}

export function max_by_col(matrix: Array<Array<number>>): Array<number> {
  return reduce_by_col(matrix, (a, b) => b > a)
}

function reduce_by_col(
  matrix: Array<Array<number>>,
  cmp: (a: number, b: number) => boolean
): Array<number> {
  return matrix.reduce((acc, row) => {
    const reduced_so_far = []
    for (let i = 0; i < row.length; i++) {
      const a = acc[i]!
      const b = row[i]!
      if (cmp(a, b)) {
        reduced_so_far.push(b)
      } else {
        reduced_so_far.push(a)
      }
    }
    return reduced_so_far
  })
}

