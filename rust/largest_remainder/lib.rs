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
    let remaining_n_seats = total_seats - result.iter().sum::<usize>();

    // Benchmarks shows that using loops (O(p^2)) instead of sorting is slower
    // Using a O(m*n) (m=p, n=remaining_n_seats) algorithm has no
    // significant difference, so sorting is kept for better readability
    // O(p*log(p))
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
