// according to flamegraph profiling, these functions are the hottest
// (generate_voters and generate_ballots)
use crate::{distance::distance_non_stv, rng::Fastrand};
use rand::prelude::Distribution;
use rand_distr::Normal;

use crate::*;

pub fn generate_voters(
    voter_mean: (f32, f32),
    n_voters: usize,
    stdev: f32,
) -> Vec<XY> {
    let mut rng = Fastrand::new();
    let n = Normal::new(voter_mean.0 as f64, stdev as f64)
        .expect("mean should not be NaN");
    let xs = n.sample_iter(&mut rng);

    let mut rng = Fastrand::new();
    let n = Normal::new(voter_mean.1 as f64, stdev as f64)
        .expect("mean should not be NaN");
    let ys = n.sample_iter(&mut rng);

    xs.zip(ys)
        .map(|(x, y)| XY {
            x: x as f32,
            y: y as f32,
        })
        .take(n_voters)
        .collect()
}

pub fn generate_ballots(
    voters: &[XY],
    parties: &[Party],
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ballots: &mut [usize],
) {
    voters.iter().enumerate().for_each(|(j, voter)| {
        #[cfg(feature = "progress_bar")]
        bar.inc(1);
        let distances = parties
            .iter()
            .enumerate()
            .map(|(idx, party)| (idx, distance_non_stv(party, voter)));
        // small benchmarks suggests no improvement to use minnumf32
        // if a voter is tied, it doesn't mean the entire election
        // is tied, so we can just ignore it
        let p = distances
            .min_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            })
            .map(|(p, _)| p)
            .expect("there should be at least one party");
        ballots[j] = p;
    });
}
