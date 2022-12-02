use std::collections::HashMap;
use std::hash::Hash;

use plotters::style::RGBColor;

use crate::simulator::*;

/// A decimal resource to allocate between integer seats.
#[derive(Clone, Debug)]
pub struct Party {
    pub x: f64,
    pub y: f64,
    pub name: String,
    pub color: RGBColor,
}

impl PartialEq for Party {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

impl Eq for Party {}

impl Hash for Party {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.name.hash(state);
    }
}

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    fn allocate_seats(
        &self,
        ballots: Vec<Party>,
        total_seats: u32,
    ) -> AllocationResult;

    fn simulate_elections(
        &self,
        n_seats: u32,
        n_voters: usize,
        parties: &[Party],
    ) -> Vec<((f64, f64), AllocationResult)> {
        // TODO: take domain as parameter
        let domain = (-100..100).map(|x| x as f64 / 100.);
        domain
            .clone()
            .flat_map(|x| domain.clone().map(move |y| (x, y)))
            .map(|voter_mean| {
                let voters = generate_voters(voter_mean, n_voters);
                (
                    voter_mean,
                    self.simulate_election(n_seats, parties, &voters),
                )
            })
            .collect()
    }
    fn simulate_election(
        &self,
        n_seats: u32,
        parties: &[Party],
        voters: &[Voter],
    ) -> AllocationResult {
        let ballots = generate_ballots(voters, parties);
        self.allocate_seats(ballots, n_seats)
    }
}

/// The result of an allocation
pub type AllocationResult = HashMap<Party, u32>;

#[derive(Debug)]
pub struct Voter {
    pub x: f64,
    pub y: f64,
}
