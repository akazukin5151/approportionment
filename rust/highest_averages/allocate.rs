use crate::{types::AllocationResult, utils::count_freqs};

use super::divisor::Quotient;

/// O(v + s*p) where
/// - v is the number of voters
/// - s is the number of seats
/// - p is the number of parties
/// The number of seats are highly likely to be fixed and less than 1000.
/// The number of parties are likely to be less than 100
/// So this is essentially O(v) as s*p are constants and likely won't
/// grow endlessly
pub fn allocate_highest_average(
    divisor: &impl Quotient,
    total_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    // O(v)
    let mut counts: Vec<_> = count_freqs(ballots, n_parties)
        .iter()
        .map(|x| *x as f32)
        .collect();
    // the len of counts is n_parties, which should be relatively very small
    // so cloning it once should not be a big impact on performance
    let originals = counts.clone();

    // by default, all parties start with 0 seats
    let mut result: Vec<usize> = vec![0; n_parties];

    // as long as there are seats remaining to be allocated, find the
    // best party to allocate a seat to
    // a single loop is O(p) and it loops s times so the entire loop is O(s*p)
    let mut current_seats = 0;
    while current_seats < total_seats {
        // find the party with most votes
        // O(p)
        let (pos, _) = counts
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| {
                a.partial_cmp(b).expect("partial_cmp found NaN")
            })
            .expect("counts is empty");

        // give the largest party 1 seat.
        result[pos] += 1;
        let n_seats_won = result[pos];

        // Apply the highest averages quotient to the original votes
        // to get the new number of votes
        // ballots_by_party is unchanged from the original
        let original_votes = originals[pos];
        let new_votes = divisor.quotient(original_votes, n_seats_won as f32);
        counts[pos] = new_votes;

        current_seats += 1;
    }

    result
}
