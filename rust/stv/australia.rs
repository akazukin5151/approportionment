// benchmark results from longest to fastest:
// 1. generate_stv_ballots
// 2. elect_and_transfer
// 3. eliminate_and_transfer
// 4. generate_voters

use crate::*;
use stv::types::StvBallot;
use stv::core::allocate_seats_stv;

pub struct StvAustralia(pub(crate) Vec<StvBallot>);

impl StvAustralia {
    pub fn ballots(&self) -> &Vec<StvBallot> {
        &self.0
    }
}

impl Allocate for StvAustralia {
    fn new(n_voters: usize, n_candidates: usize) -> Self {
        Self(vec![StvBallot(vec![0; n_candidates]); n_voters])
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
