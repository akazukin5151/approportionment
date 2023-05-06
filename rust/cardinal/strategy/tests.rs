use crate::cardinal::strategy::*;
use std::ops::Range;

use proptest::{collection::vec, prelude::*};

use crate::utils::f32_cmp;

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
