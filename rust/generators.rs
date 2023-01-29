use rand::prelude::Distribution;
use statrs::distribution::Normal;

use crate::*;

pub fn generate_voters(
    voter_mean: (f32, f32),
    n_voters: usize,
    stdev: f32,
) -> Vec<Voter> {
    let n = Normal::new(voter_mean.0 as f64, stdev as f64)
        .expect("mean should not be NaN");
    let xs = n.sample_iter(rand::thread_rng());

    let n = Normal::new(voter_mean.1 as f64, stdev as f64)
        .expect("mean should not be NaN");
    let ys = n.sample_iter(rand::thread_rng());

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
) -> Vec<usize> {
    voters
        .iter()
        .map(|voter| {
            if let Some(b) = bar {
                b.inc(1);
            }
            let distances = parties.iter().enumerate().map(|(idx, party)| {
                // 2: sub
                let a = (party.x - voter.x).powi(2);
                let b = (party.y - voter.y).powi(2);
                // we don't actually want the distances, but to find the smallest one.
                // both a and b are positive because they are squared,
                // so we can skip the sqrt, as sqrt is monotonic for positive numbers:
                // the order of values do not change after sqrt so we can
                // find the smallest distance squared instead of smallest distance
                // 1: powf (sqrt)
                // 4: add
                (idx, a + b)
            });
            distances
                // 3: fold
                .min_by(|(_, a), (_, b)| {
                    a.partial_cmp(b).expect("partial_cmp found NaN")
                })
                .map(|(p, _)| p)
                .expect("there should be at least one party")
        })
        .collect()
}
