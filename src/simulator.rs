use rand::prelude::Distribution;
use statrs::distribution::Normal;

use crate::*;

pub fn simulate_elections(
    allocator: fn(Vec<Party>) -> Box<dyn Allocate>,
    n_seats: u32,
    parties: &[Party],
) -> Vec<((f64, f64), AllocationResult)> {
    // TODO: take domain as parameter
    let domain = (-100..100).map(|x| x as f64 / 100.);
    domain
        .clone()
        .flat_map(|x| domain.clone().map(move |y| (x, y)))
        .map(|voter_mean| {
            let voters = generate_voters(voter_mean);
            (voter_mean, simulate_election(allocator, n_seats, parties, &voters))
        })
        .collect()
}

fn generate_voters(voter_mean: (f64, f64)) -> Vec<Voter> {
    // TODO: take stdev as parameter
    let n = Normal::new(voter_mean.0, 1.).unwrap();
    let xs = n.sample_iter(rand::thread_rng());

    let n = Normal::new(voter_mean.1, 1.).unwrap();
    let ys = n.sample_iter(rand::thread_rng());

    // TODO: take n_voters as parameter
    xs.zip(ys).map(|(x, y)| Voter { x, y }).take(10).collect()
}

fn simulate_election(
    allocator: fn(Vec<Party>) -> Box<dyn Allocate>,
    n_seats: u32,
    parties: &[Party],
    voters: &[Voter],
) -> AllocationResult {
    let ballots = generate_ballots(voters, parties);
    allocator(ballots).allocate_seats(n_seats)
}

fn generate_ballots(voters: &[Voter], parties: &[Party]) -> Vec<Party> {
    voters
        .iter()
        .map(|voter| {
            let distances = parties.iter().map(|party| {
                let a = (party.x - voter.x).powi(2);
                let b = (party.y - voter.y).powi(2);
                (party, (a + b).powf(0.5))
            });
            distances
                .min_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
                .map(|(p, _)| p)
                .unwrap()
        })
        .cloned()
        .collect()
}
