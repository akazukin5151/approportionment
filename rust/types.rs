use indicatif::ProgressBar;
use serde::Deserialize;
use serde_dhall::StaticType;

use crate::config::AllocationMethod;
use crate::config::Rgb;
use crate::highest_averages::*;
use crate::largest_remainder::*;
use crate::simulator::*;

#[derive(Debug)]
pub struct Voter {
    pub x: f32,
    pub y: f32,
}

/// A decimal resource to allocate between integer seats.
#[derive(Deserialize, StaticType, Clone, Debug)]
pub struct Party {
    pub x: f32,
    pub y: f32,
    pub name: String,
    pub color: Rgb,
}

/// The result of an allocation
pub type AllocationResult = Vec<u32>;

/// A process that can allocate decimal resources into integer seats
pub trait Allocate {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult;

    fn simulate_elections(
        &self,
        n_seats: u32,
        n_voters: usize,
        parties: &[Party],
        bar: &Option<ProgressBar>,
    ) -> Vec<((f32, f32), AllocationResult)> {
        // where Self: Sync,
        // TODO: take domain as parameter
        let domain = (-100..100).map(|x| x as f32 / 100.);
        domain
            .clone()
            .flat_map(|x| domain.clone().map(move |y| (x, y)))
            // Benchmarks showed that this doesn't significantly improve
            // performance but increases the variance
            //.par_bridge()
            .map(|voter_mean| {
                let voters = generate_voters(voter_mean, n_voters);
                let ballots = generate_ballots(&voters, parties, bar);
                (
                    voter_mean,
                    self.allocate_seats(ballots, n_seats, parties.len()),
                )
            })
            .collect()
    }
}

impl Allocate for AllocationMethod {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        match self {
            AllocationMethod::DHondt => {
                DHondt.allocate_seats(ballots, total_seats, n_parties)
            }
            AllocationMethod::WebsterSainteLague => WebsterSainteLague
                .allocate_seats(ballots, total_seats, n_parties),
            AllocationMethod::Droop => {
                Droop.allocate_seats(ballots, total_seats, n_parties)
            }
            AllocationMethod::Hare => {
                Hare.allocate_seats(ballots, total_seats, n_parties)
            }
        }
    }
}
