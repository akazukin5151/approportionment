mod highest_averages;
#[cfg(test)]
mod test_utils;

use highest_averages::*;
#[cfg(test)]
use test_utils::*;

use ordered_float::NotNan;
use std::collections::HashMap;
use std::hash::Hash;

fn main() {
    println!("Hello, world!");
}

fn count_freqs<T: Eq + Hash>(xs: &[T]) -> HashMap<&T, u64> {
    let mut counts = HashMap::new();
    for x in xs {
        counts.entry(x).and_modify(|c| *c += 1).or_insert(1);
    }
    counts
}

/// x and y coordinates should not be calculated, and should be hardcoded
/// directly as magic numbers (or `const` values), because float equality
/// is inexact, so counting ballots may fail
#[derive(PartialEq, Eq, Hash, Clone, Debug)]
pub struct Party {
    x: NotNan<f64>,
    y: NotNan<f64>,
    name: String,
    color: String,
}

pub struct Voter {
    x: f64,
    y: f64,
}

type ElectionResult = HashMap<Party, u32>;

