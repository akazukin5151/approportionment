use crate::*;

/// O(v + p + p*log(p)) where
/// - v is the number of voters
/// - p is the number of parties
/// The number of parties are likely to be less than 100
/// So this is essentially O(v) as p + p*log(p) are constants
/// and likely won't grow endlessly
/// The log in the constant term makes this less likely to grow
/// asymptotically compared to the constant term in the
/// highest averages methods (s*p)
pub fn allocate_largest_remainder(
    quota_f: fn(u32, u32) -> f32,
    total_seats: u32,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    // O(v)
    let counts = count_freqs(ballots, n_parties);

    let quota = quota_f(ballots.len() as u32, total_seats);

    // O(p)
    let (mut result, mut remainders): (Vec<_>, Vec<_>) = counts
        .iter()
        .enumerate()
        .map(|(idx, x)| {
            let div = *x as f32 / quota;
            let automatic_seats = div.floor();
            let remainder = div - automatic_seats;
            (automatic_seats as u32, (idx, remainder))
        })
        .unzip();

    // O(p)
    let remaining_n_seats = total_seats - result.iter().sum::<u32>();

    // Benchmarks shows that using loops (O(p^2)) instead of sorting is slower
    // O(p*log(p))
    remainders.sort_by(|(_, a), (_, b)| {
        a.partial_cmp(b).expect("partial_cmp found NaN")
    });

    // iterating on highest remainders are technically O(p)
    // but usually there are very few remaining seats
    // so they are practically O(1)
    let highest_remainder_seats =
        remainders.iter().rev().take(remaining_n_seats as usize);
    let highest_remainder_parties = highest_remainder_seats.map(|(idx, _)| idx);

    for party in highest_remainder_parties {
        result[*party] += 1;
    }

    result
}
