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
    let counts_divided_by_quota =
        counts.iter().map(|x| *x as f32 / quota);

    let mut result = vec![0; n_parties];
    let mut remainders = vec![];
    // O(p)
    for (idx, x) in counts_divided_by_quota.enumerate() {
        let as_ = x.floor();
        let remainder = x - as_;
        result[idx] = as_ as u32;
        remainders.push((idx, remainder));
    }

    // O(p)
    let remaining_n_seats = total_seats - result.iter().sum::<u32>();

    // TODO(perf): optimize for only taking highest X amount instead of sorting all
    // O(p*log(p))
    remainders.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());

    // iterating on highest remainders are technically O(p)
    // but usually there are very few remaining seats
    // so they are practically O(1)
    let highest_remainder_seats = remainders
        .iter()
        .rev()
        .take(remaining_n_seats as usize);
    let highest_remainder_parties = highest_remainder_seats.map(|(idx, _)| idx);

    for party in highest_remainder_parties {
        result[*party] += 1;
    }

    result
}
