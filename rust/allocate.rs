#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;
#[cfg(feature = "voters_sample")]
use rand::seq::SliceRandom;
use rand::RngCore;

use crate::{
    generators::generate_voters,
    rng::Fastrand,
    types::{
        AllocationResult, Party, SimulateElectionsArgs, SimulationResult, XY,
    },
};

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    fn allocate_seats(
        &mut self,
        total_seats: usize,
        n_parties: usize,
        n_voters: usize,
        #[cfg(test)] rounds: &mut Vec<Vec<usize>>,
    ) -> AllocationResult;

    /// Generate ballots for every voter. Store the result in the struct.
    /// Overwrite all data and do not read from it as it may contain data from
    /// the previous election
    fn generate_ballots(
        &mut self,
        voters: &[XY],
        parties: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
    );

    fn simulate_elections(
        &mut self,
        args: &SimulateElectionsArgs,
    ) -> Vec<SimulationResult> {
        // Hardcoded domain is not worth changing it as
        // any other domain can be easily mapped to between -1 to 1
        let domain = (-100..100).map(|x| x as f32 / 100.);
        let range = (-100..100).rev().map(|y| y as f32 / 100.);
        let mut rng = Fastrand::new(args.seed);

        // Every coordinate is accessed so cloning does not hurt performance
        range
            .flat_map(|y| domain.clone().map(move |x| (x, y)))
            // Benchmarks showed that this doesn't significantly improve
            // performance but increases the variance
            .map(|voter_mean| -> SimulationResult {
                let election_seed = if args.seed.is_some() {
                    Some(rng.next_u64())
                } else {
                    None
                };
                self.simulate_single_election(args, voter_mean, election_seed)
            })
            .collect()
    }

    fn simulate_single_election(
        &mut self,
        args: &SimulateElectionsArgs,
        voter_mean: (f32, f32),
        election_seed: Option<u64>,
    ) -> SimulationResult {
        let xy_seeds = if election_seed.is_some() {
            let mut rng = Fastrand::new(election_seed);
            (Some(rng.next_u64()), Some(rng.next_u64()))
        } else {
            (None, None)
        };
        let voters =
            generate_voters(voter_mean, args.n_voters, args.stdev, xy_seeds);
        self.generate_ballots(
            &voters,
            &args.parties,
            #[cfg(feature = "progress_bar")]
            args.bar,
        );
        SimulationResult {
            x: voter_mean.0,
            y: voter_mean.1,
            seats_by_party: self.allocate_seats(
                args.n_seats,
                args.parties.len(),
                args.n_voters,
                #[cfg(test)]
                &mut vec![],
            ),
            #[cfg(feature = "voters_sample")]
            voters_sample: load_voters_sample(args.use_voters_sample, &voters),
        }
    }
}

#[cfg(feature = "voters_sample")]
fn load_voters_sample(
    use_voters_sample: bool,
    voters: &[XY],
) -> Option<Vec<XY>> {
    if use_voters_sample {
        let mut rng = rand::thread_rng();
        let r: Vec<_> =
            voters.choose_multiple(&mut rng, 100).copied().collect();
        Some(r)
    } else {
        None
    }
}
