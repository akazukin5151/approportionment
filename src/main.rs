mod highest_averages;
mod largest_remainder;
mod simulator;
#[cfg(test)]
mod test_utils;

use highest_averages::*;
use largest_remainder::*;
use simulator::*;
#[cfg(test)]
use test_utils::*;

use std::collections::HashMap;
use std::hash::Hash;

fn main() {
    let rs = simulate_elections(|x| Box::new(DHondt(x)));
    dbg!(rs);
}

fn count_freqs<T: Eq + Hash>(xs: &[T]) -> HashMap<&T, u64> {
    let mut counts = HashMap::new();
    for x in xs {
        counts.entry(x).and_modify(|c| *c += 1).or_insert(1);
    }
    counts
}

/// A decimal resource to allocate between integer seats.
/// x and y coordinates should not be calculated, and should be hardcoded
/// directly as magic numbers (or `const` values), because float equality
/// is inexact, so counting ballots may fail
#[derive(Clone, Debug)]
pub struct Party {
    x: f64,
    y: f64,
    name: String,
    color: String,
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
    fn allocate_seats(&self, total_seats: u32) -> AllocationResult;
}

/// The result of an allocation
pub type AllocationResult = HashMap<Party, u32>;

#[derive(Debug)]
pub struct Voter {
    x: f64,
    y: f64,
}
