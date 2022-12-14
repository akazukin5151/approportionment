use crate::*;

/// O(v + s*p) where
/// - v is the number of voters
/// - s is the number of seats
/// - p is the number of parties
/// The number of seats are highly likely to be fixed and less than 1000.
/// The number of parties are likely to be less than 100
/// So this is essentially O(v) as s*p are constants and likely won't
/// grow endlessly
pub fn allocate_highest_average(
    quotient: fn(u32, u32) -> u32,
    total_seats: u32,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    // O(v)
    let mut counts = count_freqs(ballots, n_parties);
    // the len of counts is n_parties, which should be relatively very small
    // so cloning it once should not be a big impact on performance
    let originals = counts.clone();

    // by default, all parties start with 0 seats
    let mut result: Vec<u32> = vec![0; n_parties];

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
            .max_by_key(|(_, v)| *v)
            .expect("counts is empty");

        // give the largest party 1 seat.
        result[pos] += 1;
        let n_seats_won = result[pos];

        // Apply the highest averages quotient to the original votes
        // to get the new number of votes
        // ballots_by_party is unchanged from the original
        let original_votes = originals[pos];
        let new_votes = quotient(original_votes, n_seats_won);
        counts[pos] = new_votes;

        current_seats += 1;
    }

    result
}
