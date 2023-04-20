#[cfg(test)]
mod tests;

use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    types::{AllocationResult, Party, XY},
};

use super::{allocate::allocate_largest_remainder, quota::Quota};

pub struct LargestRemainders(Vec<usize>, Quota);

impl LargestRemainders {
    pub fn new(n_voters: usize, quota: Quota) -> Self {
        Self(vec![0; n_voters], quota)
    }
}

impl Allocate for LargestRemainders {
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
        allocate_largest_remainder(&self.1, total_seats, &self.0, n_parties)
    }
}
