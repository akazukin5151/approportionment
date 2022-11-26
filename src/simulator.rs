use rand::prelude::Distribution;
use statrs::distribution::Normal;

use crate::*;

pub fn simulate_elections() -> Vec<AllocationResult> {
    // TODO: take as parameter
    let domain = (-100..100).map(|x| x as f64 / 100.);
    domain
        .clone()
        .flat_map(|x| domain.clone().map(move |y| (x, y)))
        .map(|voter_mean| {
            let voters = generate_voters(voter_mean);
            simulate_election(&voters)
        })
        .collect()
}

fn generate_voters(voter_mean: (f64, f64)) -> Vec<Voter> {
    // TODO: take stdev as parameter
    let n = Normal::new(voter_mean.0, 1.).unwrap();
    let xs = n.sample_iter(rand::thread_rng());

    let n = Normal::new(voter_mean.1, 1.).unwrap();
    let ys = n.sample_iter(rand::thread_rng());

    xs.zip(ys).map(|(x, y)| Voter { x, y }).collect()
}

fn simulate_election(voters: &[Voter]) -> AllocationResult {
    // TODO: take parties as parameter
    let parties = &[
        Party {
            x: -0.7,
            y: 0.7,
            name: "A".to_string(),
            color: "red".to_string(),
        },
        Party {
            x: 0.7,
            y: 0.7,
            name: "B".to_string(),
            color: "blue".to_string(),
        },
        Party {
            x: -0.7,
            y: 0.7,
            name: "C".to_string(),
            color: "green".to_string(),
        },
        Party {
            x: -0.7,
            y: -0.7,
            name: "D".to_string(),
            color: "orange".to_string(),
        },
    ];
    let ballots = generate_ballots(voters, parties);
    DHondt(&ballots).allocate_seats(100)
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
