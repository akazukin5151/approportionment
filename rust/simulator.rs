use rand::prelude::Distribution;
use statrs::distribution::Normal;

use crate::*;

pub fn generate_voters(voter_mean: (f32, f32), n_voters: usize) -> Vec<Voter> {
    // TODO: take stdev as parameter
    let n = Normal::new(voter_mean.0 as f64, 1.).unwrap();
    let xs = n.sample_iter(rand::thread_rng());

    let n = Normal::new(voter_mean.1 as f64, 1.).unwrap();
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
                let a = (party.x - voter.x).powi(2);
                let b = (party.y - voter.y).powi(2);
                (idx, (a + b).powf(0.5))
            });
            distances
                .min_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
                .map(|(p, _)| p)
                .unwrap()
        })
        .collect()
}
