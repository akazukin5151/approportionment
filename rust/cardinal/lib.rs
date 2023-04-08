use crate::{
    allocate::Allocate,
    cardinal::{
        allocate::allocate_cardinal, generate::generate_cardinal_ballots,
    },
    types::{AllocationResult, Party, XY},
};

use super::strategy::CardinalStrategy;

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

pub struct Cardinal {
    /// A row-major matrix with `n_candidates` columns and `n_voters` rows.
    /// Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    pub(crate) ballots: Vec<f32>,
    pub strategy: CardinalStrategy,
}

impl Cardinal {
    pub fn new(n_voters: usize, n_candidates: usize) -> Self {
        Self {
            ballots: vec![0.; n_candidates * n_voters],
            strategy: CardinalStrategy::default(),
        }
    }
}

impl Allocate for Cardinal {
    fn allocate_seats(
        &self,
        total_seats: usize,
        n_candidates: usize,
        n_voters: usize,
        #[cfg(test)] _rounds: &mut Vec<Vec<usize>>,
    ) -> AllocationResult {
        let ballots = self.ballots.clone();
        allocate_cardinal(ballots, total_seats, n_candidates, n_voters)
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        candidates: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
        #[cfg(feature = "stv_party_discipline")] _: &[usize],
        #[cfg(feature = "stv_party_discipline")] _: usize,
    ) {
        generate_cardinal_ballots(
            voters,
            candidates,
            #[cfg(feature = "progress_bar")]
            bar,
            &self.strategy,
            &mut self.ballots,
        );
    }
}
