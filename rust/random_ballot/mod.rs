use rand::seq::SliceRandom;

use crate::{
    allocate::Allocate,
    generators::generate_ballots,
    rng::Fastrand,
    types::{AllocationResult, SimulateElectionsArgs, XY},
};

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;

pub struct RandomBallot(Vec<usize>);

impl RandomBallot {
    pub fn new(n_voters: usize) -> Self {
        Self(vec![0; n_voters])
    }
}

impl Allocate for RandomBallot {
    fn allocate_seats(
        &mut self,
        total_seats: usize,
        n_parties: usize,
        _n_voters: usize,
        #[cfg(test)] _rounds: &mut Vec<Vec<usize>>,
    ) -> AllocationResult {
        let mut rng = Fastrand::new(None);
        let mut r = vec![0; n_parties];
        for p in self.0.choose_multiple(&mut rng, total_seats) {
            r[*p] += 1;
        }
        r
    }

    fn generate_ballots(
        &mut self,
        voters: &[XY],
        args: &SimulateElectionsArgs,
    ) {
        generate_ballots(voters, args, &mut self.0);
    }
}
