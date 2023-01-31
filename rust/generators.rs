use std::intrinsics::{fsub_fast, fmul_fast, fadd_fast};

// according to flamegraph profiling, these functions are the hottest
// (generate_voters and generate_ballots)
use crate::rng::Fastrand;
use rand::prelude::Distribution;
use rand_distr::Normal;

use crate::*;

pub fn generate_voters(
    voter_mean: (f32, f32),
    n_voters: usize,
    stdev: f32,
) -> Vec<Voter> {
    let mut rng = Fastrand::new();
    let n = Normal::new(voter_mean.0 as f64, stdev as f64)
        .expect("mean should not be NaN");
    let xs = n.sample_iter(&mut rng);

    let mut rng = Fastrand::new();
    let n = Normal::new(voter_mean.1 as f64, stdev as f64)
        .expect("mean should not be NaN");
    let ys = n.sample_iter(&mut rng);

    xs.zip(ys)
        .map(|(x, y)| Voter {
            x: x as f32,
            y: y as f32,
        })
        .take(n_voters)
        .collect()
}

pub fn generate_ballots(
    voters: &[Voter],
    parties: &[Party],
    bar: &Option<ProgressBar>,
    ballots: &mut [usize],
) {
    voters.iter().enumerate().for_each(|(j, voter)| {
        if let Some(b) = bar {
            b.inc(1);
        }
        let distances = parties.iter().enumerate().map(|(idx, party)| {
            unsafe {
                let a = fsub_fast(party.x, voter.x);
                let a_square = fmul_fast(a, a);
                let b = fsub_fast(party.y, voter.y);
                let b_square = fmul_fast(b, b);
                // we don't actually want the distances, but to find the smallest one.
                // both a and b are positive because they are squared,
                // so we can skip the sqrt, as sqrt is monotonic for positive numbers:
                // the order of values do not change after sqrt so we can
                // find the smallest distance squared instead of smallest distance
                (idx, fadd_fast(a_square, b_square))
            }
        });
        let p = distances
            .min_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            })
            .map(|(p, _)| p)
            .expect("there should be at least one party");
        ballots[j] = p;
    });
}
