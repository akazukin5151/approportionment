use crate::{
    allocate::Allocate,
    cardinal::generate::generate_cardinal_ballots,
    types::{AllocationResult, SimulateElectionsArgs, XY},
};

use super::{allocate::CardinalAllocator, strategy::CardinalStrategy};

pub struct Cardinal {
    /// A row-major matrix with `n_candidates` columns and `n_voters` rows.
    /// Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
    pub ballots: Vec<f32>,
    strategy: CardinalStrategy,
    allocator: CardinalAllocator,
}

impl Cardinal {
    pub fn new(
        n_voters: usize,
        n_candidates: usize,
        strategy: CardinalStrategy,
        allocator: CardinalAllocator,
    ) -> Self {
        Self {
            ballots: vec![0.; n_candidates * n_voters],
            strategy,
            allocator,
        }
    }
}

impl Allocate for Cardinal {
    fn allocate_seats(
        &mut self,
        total_seats: usize,
        n_candidates: usize,
        n_voters: usize,
        #[cfg(test)] _rounds: &mut Vec<Vec<f32>>,
    ) -> AllocationResult {
        self.allocator.run(
            &mut self.ballots,
            n_voters,
            total_seats,
            n_candidates,
        )
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        args: &SimulateElectionsArgs,
    ) {
        generate_cardinal_ballots(
            voters,
            args,
            &self.strategy,
            &mut self.ballots,
        );
    }
}
