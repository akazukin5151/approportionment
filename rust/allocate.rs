use crate::generators::*;
use crate::types::*;
use indicatif::ProgressBar;
use rand::seq::SliceRandom;

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    type Ballot;

    fn allocate_seats(
        &self,
        ballots: Vec<Self::Ballot>,
        total_seats: usize,
        n_parties: usize,
    ) -> AllocationResult;

    fn generate_ballots(
        &self,
        voters: &[Voter],
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) -> Vec<Self::Ballot>;

    fn simulate_elections(
        &self,
        n_seats: usize,
        n_voters: usize,
        parties: &[Party],
        bar: &Option<ProgressBar>,
        use_voters_sample: bool
    ) -> Vec<SimulationResult> {
        // where Self: Sync,
        // Hardcoded domain is not worth changing it as
        // any other domain can be easily mapped to between -1 to 1
        let domain = (-100..100).map(|x| x as f32 / 100.);
        let range = (-100..100).rev().map(|y| y as f32 / 100.);
        // Every coordinate is accessed so cloning does not hurt performance
        range
            .flat_map(|y| domain.clone().map(move |x| (x, y)))
            // Benchmarks showed that this doesn't significantly improve
            // performance but increases the variance
            //.par_bridge()
            .map(|voter_mean| {
                self.simulate_single_election(
                    n_seats, n_voters, parties, bar, voter_mean,
                    use_voters_sample
                )
            })
            .collect()
    }

    fn simulate_single_election(
        &self,
        n_seats: usize,
        n_voters: usize,
        parties: &[Party],
        bar: &Option<ProgressBar>,
        voter_mean: (f32, f32),
        use_voters_sample: bool
    ) -> SimulationResult {
        let voters = generate_voters(voter_mean, n_voters);
        let ballots = self.generate_ballots(&voters, parties, bar);
        let voters_sample = if use_voters_sample {
            let mut rng = rand::thread_rng();
            let r: Vec<_> =
                voters.choose_multiple(&mut rng, 100).copied().collect();
            Some(r)
        } else {
            None
        };
        SimulationResult {
            x: voter_mean.0,
            y: voter_mean.1,
            seats_by_party: self.allocate_seats(
                ballots,
                n_seats,
                parties.len(),
            ),
            voters_sample,
        }
    }
}
