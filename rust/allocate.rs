use crate::generators::*;
use crate::types::*;
#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;
#[cfg(feature = "voters_sample")]
use rand::seq::SliceRandom;

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    /// The struct should store the ballots vector, which is reused
    /// for every election
    /// Initially it is empty, `self.generate_ballots` must be called to populate
    /// the vec. (In tests it can be set directly)
    fn new(n_voters: usize) -> Self
    where
        Self: Sized;

    fn allocate_seats(
        &self,
        total_seats: usize,
        n_parties: usize,
    ) -> AllocationResult;

    /// Generate ballots for every voter. Store the result in the struct.
    /// Overwrite all data and do not read from it as it may contain data from
    /// the previous election
    fn generate_ballots(
        &mut self,
        voters: &[Voter],
        parties: &[Party],
        #[cfg(feature = "progress_bar")]
        bar: &ProgressBar,
    );

    fn simulate_elections(
        &mut self,
        n_seats: usize,
        n_voters: usize,
        stdev: f32,
        parties: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
        #[cfg(feature = "voters_sample")] use_voters_sample: bool,
    ) -> Vec<SimulationResult> {
        // Hardcoded domain is not worth changing it as
        // any other domain can be easily mapped to between -1 to 1
        let domain = (-100..100).map(|x| x as f32 / 100.);
        let range = (-100..100).rev().map(|y| y as f32 / 100.);
        //let mut ballots = vec![Default::default(); n_voters];
        // Every coordinate is accessed so cloning does not hurt performance
        range
            .flat_map(|y| domain.clone().map(move |x| (x, y)))
            // Benchmarks showed that this doesn't significantly improve
            // performance but increases the variance
            .map(|voter_mean| {
                self.simulate_single_election(
                    n_seats,
                    n_voters,
                    parties,
                    #[cfg(feature = "progress_bar")]
                    bar,
                    voter_mean,
                    stdev,
                    #[cfg(feature = "voters_sample")]
                    use_voters_sample,
                )
            })
            .collect()
    }

    fn simulate_single_election(
        &mut self,
        n_seats: usize,
        n_voters: usize,
        parties: &[Party],
        #[cfg(feature = "progress_bar")] bar: &ProgressBar,
        voter_mean: (f32, f32),
        stdev: f32,
        #[cfg(feature = "voters_sample")] use_voters_sample: bool,
    ) -> SimulationResult {
        let voters = generate_voters(voter_mean, n_voters, stdev);
        self.generate_ballots(
            &voters,
            parties,
            #[cfg(feature = "progress_bar")]
            bar,
        );
        SimulationResult {
            x: voter_mean.0,
            y: voter_mean.1,
            seats_by_party: self.allocate_seats(n_seats, parties.len()),
            #[cfg(feature = "voters_sample")]
            voters_sample: load_voters_sample(use_voters_sample, voters),
        }
    }
}

#[cfg(feature = "voters_sample")]
fn load_voters_sample(
    use_voters_sample: bool,
    voters: Vec<Voter>,
) -> Option<Vec<Voter>> {
    if use_voters_sample {
        let mut rng = rand::thread_rng();
        let r: Vec<_> =
            voters.choose_multiple(&mut rng, 100).copied().collect();
        Some(r)
    } else {
        None
    }
}
