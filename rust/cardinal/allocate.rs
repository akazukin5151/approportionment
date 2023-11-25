use serde::Deserialize;
#[cfg(test)]
use serde::Serialize;

use crate::{types::AllocationResult, utils::f32_cmp};

use super::{
    phragmen::Phragmen,
    reweighter::{ReweightMethod, Reweighter},
    thiele::Thiele,
};

/// Completes the sentence "In each round, the system reweights..."
/// Where 'reweights' can either mean 'reduce' or 'increase'
// only for benchmarks
#[cfg_attr(test, derive(Serialize))]
#[derive(Clone, Copy, Deserialize)]
pub enum CardinalAllocator {
    /// In each round, reduce ballot scores based on original values
    /// Also happens to follow the Thiele interpretation of PR
    ScoreFromOriginal,
    /// In each round, reduce ballot weights, using weights from the previous round
    /// SSS follows the vote unitarity interpretation of PR
    /// StarPR follows the Monroe interpretation of PR.
    WeightsFromPrevious(ReweightMethod),
    /// In each round, increases voter loads if they contributed to the winner.
    /// A candidate with the lowest average sum of loads is a winner.
    /// These follow the Phragmen interpretation of PR
    VoterLoads,
}

impl CardinalAllocator {
    pub fn run(
        &self,
        ballots: &mut [f32],
        n_voters: usize,
        total_seats: usize,
        n_candidates: usize,
        #[cfg(any(test, feature = "counts_by_round"))] rounds: &mut Vec<
            Vec<f32>,
        >,
    ) -> AllocationResult {
        match self {
            CardinalAllocator::ScoreFromOriginal => Thiele::new(ballots)
                .allocate_cardinal(
                    ballots,
                    total_seats,
                    n_candidates,
                    n_voters,
                    #[cfg(any(test, feature = "counts_by_round"))]
                    rounds,
                ),
            CardinalAllocator::WeightsFromPrevious(reweigher) => {
                Reweighter::new(n_voters, total_seats, *reweigher)
                    .allocate_cardinal(
                        ballots,
                        total_seats,
                        n_candidates,
                        n_voters,
                        #[cfg(any(test, feature = "counts_by_round"))]
                        rounds,
                    )
            }
            CardinalAllocator::VoterLoads => {
                Phragmen::new(n_voters, n_candidates).allocate_cardinal(
                    ballots,
                    total_seats,
                    n_candidates,
                    n_voters,
                    #[cfg(any(test, feature = "counts_by_round"))]
                    rounds,
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
    ) -> Option<&[f32]>;

    fn reweight(
        &self,
        ballots: &mut [f32],
        aux: &mut [f32],
        pos: usize,
        result: &[usize],
        n_candidates: usize,
    );

    fn allocate_cardinal(
        &mut self,
        ballots: &mut [f32],
        total_seats: usize,
        n_candidates: usize,
        n_voters: usize,
        #[cfg(any(test, feature = "counts_by_round"))] rounds: &mut Vec<
            Vec<f32>,
        >,
    ) -> AllocationResult {
        // no candidates elected at the beginning
        let mut result: Vec<usize> = vec![0; n_candidates];
        let mut aux = vec![self.aux_init(); n_voters];

        let mut current_seats = 0;
        while current_seats < total_seats {
            let mut counts = vec![0.; n_candidates];
            let c = self.count(ballots, n_candidates, &result, &mut counts, &aux);
            #[cfg(any(test, feature = "counts_by_round"))]
            rounds.push(c.unwrap_or(&counts).to_vec());

            // find the candidate with most votes
            let (pos, _) = self.find_max(
                &counts,
                n_candidates,
                total_seats,
                &result,
                &aux,
                ballots,
            );

            // give the largest candidate 1 seat.
            result[pos] += 1;

            self.reweight(ballots, &mut aux, pos, &result, n_candidates);

            current_seats += 1;
        }

        result
    }

    fn find_max<'a>(
        &'a mut self,
        counts: &'a [f32],
        _n_candidates: usize,
        _n_seats: usize,
        _result: &[usize],
        _aux: &[f32],
        _ballots: &[f32],
    ) -> (usize, &f32) {
        counts
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| f32_cmp(a, b))
            .expect("counts is empty")
    }
}
