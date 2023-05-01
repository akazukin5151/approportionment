// flamegraph shows hot paths to be, from most to least heavy:
// 1) generate_stv_ballots
// 2) elect_and_transfer
// 3) eliminate_and_transfer
// 4) generate_voters

use crate::{
    allocate::Allocate,
    stv::{core::allocate_seats_stv, generate_ballots::generate_stv_ballots},
    types::{AllocationResult, SimulateElectionsArgs, XY},
};

use super::party_discipline::PartyDiscipline;

pub struct StvAustralia {
    /// A row-major matrix with `n_candidates` columns and `n_voters` rows.
    /// Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    /// This was originally a vec of vecs, but it was
    /// flattened for performance: there was a 20%-30% speed gain
    pub(crate) ballots: Vec<usize>,
    rank_method: PartyDiscipline,
}

impl StvAustralia {
    pub fn new(
        n_voters: usize,
        n_candidates: usize,
        rank_method: PartyDiscipline,
    ) -> Self {
        Self {
            ballots: vec![0; n_candidates * n_voters],
            rank_method,
        }
    }

    pub fn ballots(&self) -> &Vec<usize> {
        &self.ballots
    }
}

impl Allocate for StvAustralia {
    fn generate_ballots(
        &mut self,
        voters: &[XY],
        args: &SimulateElectionsArgs,
    ) {
        generate_stv_ballots(
            voters,
            args,
            &mut self.ballots,
            &self.rank_method,
        );
    }

    fn allocate_seats(
        &mut self,
        total_seats: usize,
        n_candidates: usize,
        n_voters: usize,
        #[cfg(test)] rounds: &mut Vec<Vec<usize>>,
    ) -> AllocationResult {
        allocate_seats_stv(
            &self.ballots,
            total_seats,
            n_candidates,
            n_voters,
            #[cfg(test)]
            rounds,
        )
    }
}
