#[cfg(test)]
mod tests;

use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    types::{AllocationResult, SimulateElectionsArgs, XY},
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
        args: &SimulateElectionsArgs,
    ) {
        generate_ballots(voters, args, &mut self.0);
    }

    fn allocate_seats(
        &mut self,
        total_seats: usize,
        n_parties: usize,
        _: usize,
        #[cfg(any(test, feature = "counts_by_round"))] _: &mut Vec<Vec<f32>>,
    ) -> AllocationResult {
        allocate_highest_average(&self.1, total_seats, &self.0, n_parties)
    }
}
