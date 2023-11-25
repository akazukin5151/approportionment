use serde::Deserialize;
#[cfg(test)]
use serde::Serialize;

use super::{
    allocate::AllocateCardinal, sss::reweight_sss, star_pr::reweight_star_pr,
};

// only for benchmarks
#[cfg_attr(test, derive(Serialize))]
#[derive(Clone, Copy, Deserialize)]
pub enum ReweightMethod {
    StarPr,
    Sss,
}

/// In each round, reduce ballot weights, using weights from the previous round
pub struct Reweighter {
    quota: f32,
    method: ReweightMethod,
}

impl Reweighter {
    pub fn new(
        n_voters: usize,
        total_seats: usize,
        method: ReweightMethod,
    ) -> Self {
        Self {
            quota: n_voters as f32 / total_seats as f32,
            method,
        }
    }
}

impl AllocateCardinal for Reweighter {
    fn aux_init(&self) -> f32 {
        1.
    }

    fn count(
        &self,
        ballots: &[f32],
        n_candidates: usize,
        result: &[usize],
        counts: &mut [f32],
        aux: &[f32],
    ) -> Option<&[f32]> {
        // using linear iteration instead of chunks is much slower
        for (v_idx, ballot) in ballots.chunks_exact(n_candidates).enumerate() {
            for (c_idx, value) in ballot.iter().enumerate() {
                // only count votes for un-elected candidates
                if result[c_idx] == 0 {
                    counts[c_idx] += value * aux[v_idx];
                }
            }
        }
        None
    }

    fn reweight(
        &self,
        ballots: &mut [f32],
        aux: &mut [f32],
        pos: usize,
        _: &[usize],
        n_candidates: usize,
    ) {
        match self.method {
            ReweightMethod::StarPr => {
                reweight_star_pr(ballots, n_candidates, pos, aux, self.quota)
            }
            ReweightMethod::Sss => {
                reweight_sss(self.quota, ballots, aux, pos, n_candidates)
            }
        }
    }
}
