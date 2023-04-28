use serde::Deserialize;
#[cfg(test)]
use serde::Serialize;

use crate::types::AllocationResult;

use super::{
    common::find_max,
    reweighter::{ReweightMethod, Reweighter},
    thiele::Thiele,
};

// only for benchmarks
#[cfg_attr(test, derive(Serialize))]
#[derive(Clone, Copy, Deserialize)]
pub enum CardinalAllocator {
    /// In each round, reduce ballot scores based on original values
    Thiele,
    /// In each round, reduce ballot weights, using weights from the previous round
    IterativeReweight(ReweightMethod),
}

impl CardinalAllocator {
    pub fn run(
        &self,
        ballots: &mut [f32],
        n_voters: usize,
        total_seats: usize,
        n_candidates: usize,
    ) -> AllocationResult {
        match self {
            CardinalAllocator::Thiele => Thiele::new(ballots)
                .allocate_cardinal(
                    ballots,
                    total_seats,
                    n_candidates,
                    n_voters,
                ),
            CardinalAllocator::IterativeReweight(reweigher) => {
                Reweighter::new(n_voters, total_seats, *reweigher)
                    .allocate_cardinal(
                        ballots,
                        total_seats,
                        n_candidates,
                        n_voters,
                    )
            }
        }
    }
}

pub trait AllocateCardinal {
    fn aux_init(&self) -> f32;

    fn count(
        &self,
        ballots: &[f32],
        n_candidates: usize,
        result: &[usize],
        counts: &mut [f32],
        aux: &[f32],
    );

    fn reweight(
        &self,
        ballots: &mut [f32],
        aux: &mut [f32],
        pos: usize,
        result: &[usize],
        n_candidates: usize,
    );

    fn allocate_cardinal(
        &self,
        ballots: &mut [f32],
        total_seats: usize,
        n_candidates: usize,
        n_voters: usize,
    ) -> AllocationResult {
        // no candidates elected at the beginning
        let mut result: Vec<usize> = vec![0; n_candidates];
        let mut aux = vec![self.aux_init(); n_voters];

        let mut current_seats = 0;
        while current_seats < total_seats {
            let mut counts = vec![0.; n_candidates];
            self.count(ballots, n_candidates, &result, &mut counts, &aux);

            // find the candidate with most votes
            let (pos, _) = find_max(&counts);

            // give the largest candidate 1 seat.
            result[pos] += 1;

            self.reweight(ballots, &mut aux, pos, &result, n_candidates);

            current_seats += 1;
        }

        result
    }
}
