use crate::*;

pub fn allocate_highest_average(
    quotient: fn(u64, u32) -> u64,
    total_seats: u32,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    let mut counts = count_freqs(ballots, n_parties);
    let originals = counts.clone();

    // by default, all parties start with 0 seats
    let mut result: Vec<u32> = vec![0; n_parties];

    // as long as there are seats remaining to be allocated, find the
    // best party to allocate a seat to
    while result.iter().sum::<u32>() < total_seats {
        // find the party with most votes
        let (pos, _) =
            counts.iter().enumerate().max_by_key(|(_, v)| *v).unwrap();

        // give the largest party 1 seat.
        result[pos] += 1;
        let n_seats_won = result[pos];

        // Apply the highest averages quotient to the original votes
        // to get the new number of votes
        // ballots_by_party is unchanged from the original
        let original_votes = originals[pos];
        let new_votes = quotient(original_votes, n_seats_won);
        counts[pos] = new_votes;
    }

    result
}
