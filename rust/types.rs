use indicatif::ProgressBar;
use serde::Deserialize;
#[cfg(feature = "wasm")]
use serde::Serialize;

use crate::{config::Rgb, simulator::*};

#[cfg_attr(feature = "wasm", derive(Serialize, Deserialize))]
#[derive(Debug)]
pub struct Voter {
    pub x: f32,
    pub y: f32,
}

/// A decimal resource to allocate between integer seats.
#[derive(Deserialize, Debug, Clone)]
pub struct Party {
    pub x: f32,
    pub y: f32,
    pub name: Option<String>,
    pub color: Option<Rgb>,
}

#[cfg(test)]
impl Party {
    pub fn new(x: f32, y: f32) -> Self {
        Self {
            x,
            y,
            name: None,
            color: None,
        }
    }
}

/// The result of an allocation
pub type AllocationResult = Vec<u32>;

/// The result of a single simulation
#[cfg_attr(feature = "wasm", derive(Serialize, Deserialize))]
pub struct SimulationResult {
    pub voter_mean: Voter,
    pub seats_by_party: AllocationResult,
}

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    type Ballot;

    fn allocate_seats(
        &self,
        ballots: Vec<Self::Ballot>,
        total_seats: u32,
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
        n_seats: u32,
        n_voters: usize,
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) -> Vec<SimulationResult> {
        // where Self: Sync,
        // Hardcoded domain is not worth changing it as
        // any other domain can be easily mapped to between -1 to 1
        let domain = (-100..100).map(|x| x as f32 / 100.);
        // Every coordinate is accessed so cloning does not hurt performance
        domain
            .clone()
            .flat_map(|x| domain.clone().map(move |y| (x, y)))
            // Benchmarks showed that this doesn't significantly improve
            // performance but increases the variance
            //.par_bridge()
            .map(|voter_mean| {
                let voters = generate_voters(voter_mean, n_voters);
                let ballots = self.generate_ballots(&voters, parties, bar);
                SimulationResult {
                    voter_mean: Voter {
                        x: voter_mean.0,
                        y: voter_mean.1,
                    },
                    seats_by_party: self.allocate_seats(
                        ballots,
                        n_seats,
                        parties.len(),
                    ),
                }
            })
            .collect()
    }
}
