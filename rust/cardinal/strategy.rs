use std::cmp::Ordering;

use serde::Deserialize;

pub trait Strategy {
    fn dists_to_ballot(&self, dists: &[f32], result: &mut [f32]);
}

#[derive(Deserialize)]
pub enum CardinalStrategy {
    // Approval (integers)
    /// The approval radius for a voter is the mean distance to all candidates
    /// The voter will approve of all candidates less than or equal to the mean
    Mean,
    /// The approval radius for a voter is the median distance to all candidates
    /// The voter will approve of all candidates less than or equal to the median
    Median,
    // All voters approve of a fixed number of candidates
    // The voter will approve of the n-nearest candidates
    // FixedN(usize)

    // Score (floats)
    /// Distances are normalized (stretched from 0.0 to 1.0), and the
    /// intermediate values are transformed in a linear manner
    NormedLinear,
    // All voters will score candidates according to a fixed scale
    // The scale is a mapping of distances to scores
    // (NB: isn't a function better than a vec?)
    //
    // see also (but be careful of non monotonic functions):
    // https://www.source-code.biz/snippets/typescript/functionCurveEditor/
    // https://github.com/d3/d3-shape#curves
    // FixedScale(Vec<f32>)
}

impl Default for CardinalStrategy {
    fn default() -> Self {
        CardinalStrategy::Mean
    }
}

impl Strategy for CardinalStrategy {
    fn dists_to_ballot(&self, dists: &[f32], result: &mut [f32]) {
        match self {
            CardinalStrategy::Mean => mean_strategy(dists, result),
            CardinalStrategy::Median => median_strategy(dists, result),
            CardinalStrategy::NormedLinear => normed_linear(dists, result),
        }
    }
}

fn mean_strategy(dists: &[f32], result: &mut [f32]) {
    let mean = dists.iter().sum::<f32>() / dists.len() as f32;
    for (idx, dist) in dists.iter().enumerate() {
        if dist <= &mean {
            result[idx] = 1.;
        }
    }
}

fn median_strategy(dists: &[f32], result: &mut [f32]) {
    // as dists is already an aux vec, we can sort in place,
    // but we want to access the original indices later, so might as well
    // copy
    let mut buf = vec![0.; dists.len()];
    buf.copy_from_slice(dists);
    let median = quickselect_median(&mut buf);

    for (idx, dist) in dists.iter().enumerate() {
        if dist <= &median {
            result[idx] = 1.;
        }
    }
}

fn normed_linear(dists: &[f32], result: &mut [f32]) {
    let (max, min) =
        dists
            .iter()
            .fold((f32::MIN, f32::MAX), |(acc_max, acc_min), dist| {
                let curr_max = f32::max(acc_max, *dist);
                let curr_min = f32::min(acc_min, *dist);
                (curr_max, curr_min)
            });

    let range = max - min;
    for (idx, d) in dists.iter().enumerate() {
        result[idx] = 1. - ((d - min) / range);
    }
}

#[inline(always)]
fn f32_cmp(a: &f32, b: &f32) -> Ordering {
    a.partial_cmp(b).expect("partial_cmp found NaN")
}

fn quickselect_median(arr: &mut [f32]) -> f32 {
    // we don't care about the remainder
    #[allow(clippy::integer_division)]
    let l = arr.len() / 2;
    if arr.len() % 2 == 1 {
        *arr.select_nth_unstable_by(l, f32_cmp).1
    } else {
        let (_, lower_mid, end) = arr.select_nth_unstable_by(l - 1, f32_cmp);
        let (_, upper_mid, _) = end.select_nth_unstable_by(0, f32_cmp);
        (*lower_mid + *upper_mid) / 2.
    }
}

#[cfg(test)]
mod test {
    use std::ops::Range;

    use super::*;
    use proptest::{collection::vec, prelude::*};

    #[test]
    fn test_mean_strategy() {
        let dists = [2.3, 1.5, 3.4, 2.9];
        let mut result = [0., 0., 0., 0.];
        mean_strategy(&dists, &mut result);
        assert_eq!(result, [1., 1., 0., 0.,]);
    }

    #[test]
    fn test_median_strategy() {
        let dists = [2.3, 1.5, 3.4, 2.9];
        let mut result = [0., 0., 0., 0.];
        median_strategy(&dists, &mut result);
        assert_eq!(result, [1., 1., 0., 0.,]);
    }

    #[test]
    fn test_normed_linear() {
        let dists = [2.3, 1.5, 3.4, 2.9];
        let mut result = [0., 0., 0., 0.];
        normed_linear(&dists, &mut result);
        assert_eq!(result, [0.5789474, 1.0, 0.0, 0.2631579]);
    }

    proptest! {
        #[test]
        fn test_quickselect_median(
            // median will crash if len is 0 (0 candidates)
            // so ideally it should return an Option
            // but this isn't important here so we can ignore it
            mut v in vec(Range { start: 0.0_f32, end: 100.}, 1..100)
        ) {
            let mut cloned = v.clone();
            cloned.sort_unstable_by(f32_cmp);
            #[allow(clippy::integer_division)]
            let upper_mid = cloned.len() / 2;
            let slow_median = if v.len() % 2 == 0 {
                let lower_mid = upper_mid - 1;
                (cloned[lower_mid] + cloned[upper_mid]) / 2.
            } else {
                #[allow(clippy::integer_division)]
                cloned[upper_mid]
            };

            let median = quickselect_median(&mut v);
            assert_eq!(median, slow_median);
        }
    }
}
