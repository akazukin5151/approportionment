#[cfg(test)]
mod tests;

use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    types::{AllocationResult, Party, XY},
};

use super::{allocate::allocate_highest_average, divisor::Divisor};

pub struct HighestAverages(Vec<usize>, Divisor);

impl HighestAverages {
    pub fn new(n_voters: usize, divisor: Divisor) -> Self {
        Self(vec![0; n_voters], divisor)
    }
}

impl Allocate for HighestAverages {
    fn generate_ballots(
        &mut self,
        voters: &[XY],
        parties: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
        #[cfg(feature = "stv_party_discipline")] _: &[usize],
        #[cfg(feature = "stv_party_discipline")] _: usize,
    ) {
        generate_ballots(
            voters,
            parties,
            #[cfg(feature = "progress_bar")]
            bar,
            &mut self.0,
        );
    }

    fn allocate_seats(
        &self,
        total_seats: usize,
        n_parties: usize,
        _: usize,
        #[cfg(test)] _: &mut Vec<Vec<usize>>,
    ) -> AllocationResult {
        allocate_highest_average(&self.1, total_seats, &self.0, n_parties)
    }
}
