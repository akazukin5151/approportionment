mod dhondt;
use dhondt::*;

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
struct Party {
    x: NotNan<f64>,
    y: NotNan<f64>,
    name: String,
    color: String,
}

struct Voter {
    x: f64,
    y: f64,
}

type ElectionResult = HashMap<Party, u32>;

// TODO: can add an electoral threshold to exclude parties
// as some systems such as STV do not have an electoral threshold,
// this is best left to each implementor
// (ie, threshold as a field in the implementor)
trait ElectoralSystem {
    /// The data structure that contains information about a ballot that voters
    /// use. The ballot should contain the `Party` type in some way.
    type Ballot: Eq + Hash;

    fn generate_ballots(
        parties: &[Party],
        voters: &[Voter],
    ) -> Vec<Self::Ballot>;

    fn allocate_seats(
        // district magnitude
        total_seats: u32,
        ballots: &[Self::Ballot],
    ) -> ElectionResult;
}

trait HighestAverages {
    fn quotient(original_votes: u64, n_seats_won: u32) -> u64;

    fn generate_ballots(
        parties: &[Party],
        voters: &[Voter],
    ) -> Vec<Party>{
        todo!()
    }

    fn allocate(
        total_seats: u32,
        ballots_by_party: HashMap<&Party, u64>,
    ) -> ElectionResult {
        let mut counts: Vec<(Party, u64)> = ballots_by_party
            .iter()
            .map(|(&x, y)| (x.clone(), *y))
            .collect();

        // by default, all parties start with 0 seats
        let mut result: HashMap<Party, u32> = HashMap::new();
        for party in ballots_by_party.keys() {
            result.insert((*party).clone(), 0);
        }

        // as long as there are seats remaining to be allocated, find the
        // best party to allocate a seat to
        while result.values().copied().sum::<u32>() < total_seats {
            // sort it so that party with most votes is at the end
            counts.sort_unstable_by_key(|(_, c)| *c);

            let (largest_party, _) = counts.pop().unwrap();

            // give the largest party 1 seat.
            let n_seats_won = result
                .entry(largest_party.clone())
                .and_modify(|seats| *seats += 1)
                .or_insert(1);

            // Apply the D'Hondt quotient to the original votes
            // get the new number of votes
            // ballots_by_party is unchanged from the original
            let original_votes = ballots_by_party.get(&largest_party).unwrap();
            let new_votes = Self::quotient(*original_votes, *n_seats_won);
            counts.push((largest_party, new_votes));
        }

        result
    }
}

impl<T: HighestAverages> ElectoralSystem for T {
    type Ballot = Party;

    fn generate_ballots(
        parties: &[Party],
        voters: &[Voter],
    ) -> Vec<Self::Ballot> {
        todo!()
    }

    fn allocate_seats(
        // district magnitude
        total_seats: u32,
        ballots: &[Self::Ballot],
    ) -> ElectionResult {
        let ballots_by_party = count_freqs(ballots);
        Self::allocate(total_seats, ballots_by_party)
    }
}
