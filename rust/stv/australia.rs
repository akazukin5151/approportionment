use crate::*;
use stv::core::allocate_seats_stv;

pub struct StvAustralia(pub(crate) Vec<usize>);

impl StvAustralia {
    pub fn ballots(&self) -> &Vec<usize> {
        &self.0
    }
}

impl Allocate for StvAustralia {
    /// Represents `n_candidates` columns and `n_voters` rows
    /// This was originally a vec of vecs, but it was
    /// flattened for performance: there was a 20%-30% speed gain
    fn new(n_voters: usize, n_candidates: usize) -> Self {
        Self(vec![0; n_candidates * n_voters])
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        parties: &[XY],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    ) {
        generate_stv_ballots(
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
        n_candidates: usize,
    ) -> AllocationResult {
        allocate_seats_stv(&self.0, total_seats, n_candidates)
    }
}
