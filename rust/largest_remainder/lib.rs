use crate::*;

/// O(v + p + p + p*log(p) + p) ~=O(v + p + p*log(p)) where
/// - v is the number of voters
/// - p is the number of parties
///
/// The number of parties are likely to be less than 100
/// So this is essentially O(v) as p + p*log(p) are constants
/// and likely won't grow endlessly
pub fn allocate_largest_remainder(
    quota_f: fn(usize, usize) -> f32,
    total_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    // O(v)
    let counts = count_freqs(ballots, n_parties);

    let quota = quota_f(ballots.len(), total_seats);

    // O(p)
    let (mut result, mut remainders): (Vec<_>, Vec<_>) = counts
        .iter()
        .enumerate()
        .map(|(idx, x)| {
            let div = *x as f32 / quota;
            let automatic_seats = div.floor();
            let remainder = div - automatic_seats;
            (automatic_seats as usize, (idx, remainder))
        })
        .unzip();

    // O(p)
    let remaining_n_seats =
        usize::min(total_seats - result.iter().sum::<usize>(), n_parties);

    // O(p*log(p))
    // For small vectors, rust switches to insertion sort, which is O(p^2)
    // but faster for small vectors. The "better" time complexity of quicksort
    // is used as the quadratic time would be misleading
    remainders.sort_by(|(_, a), (_, b)| {
        b.partial_cmp(a).expect("partial_cmp found NaN")
    });

    // iterating on highest remainders are technically O(p)
    // but usually there are very few remaining seats
    // so they are practically O(1)
    let largest_remainders = &remainders[0..remaining_n_seats];

    for (party, _) in largest_remainders {
        result[*party] += 1;
    }

    result
}
